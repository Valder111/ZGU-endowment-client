import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const enabled = process.env.VITE_API_BASE_URL === '/api/v1';
const uuid = (n: number) =>
  `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const paymentId = uuid(1),
  donationId = uuid(2),
  projectId = uuid(3);
type Refund = {
  id: string;
  payment_id: string;
  amount: string;
  status: string;
  created_at: string;
  completed_at?: string;
};

async function mock(page: Page, role = 'admin') {
  const state = {
    signed: false,
    status: 'paid',
    provider: '4382232746',
    code: 200,
    drop: false,
    pending: false,
    requests: [] as Record<string, string>[],
    syncs: 0,
    ledgerError: 0,
    refunds: [
      {
        id: uuid(4),
        payment_id: paymentId,
        amount: '20.00',
        status: 'completed',
        created_at: '2026-11-19T01:00:00Z',
        completed_at: '2026-11-19T01:01:00Z',
      },
    ] as Refund[],
    release: undefined as (() => void) | undefined,
    delay: false,
  };
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    if (path === '/login') {
      state.signed = true;
      return route.fulfill({ json: { role } });
    }
    if (path === '/me')
      return state.signed
        ? route.fulfill({
            json: {
              id: uuid(99),
              role,
              is_active: true,
              email: 'admin@example.test',
            },
          })
        : route.fulfill({ status: 401 });
    if (path === `/payments/${paymentId}/reverse`) {
      state.requests.push(route.request().postDataJSON());
      if (state.delay)
        await new Promise<void>((resolve) => {
          state.release = resolve;
        });
      if (state.drop) return route.abort('failed');
      if (state.code !== 200)
        return route.fulfill({
          status: state.code,
          json: { error: 'Возврат отклонён банком' },
        });
      state.refunds.push({
        id: uuid(5),
        payment_id: paymentId,
        amount: state.requests.at(-1)!.amount!,
        status: state.pending ? 'pending' : 'completed',
        created_at: '2026-11-19T02:00:00Z',
        ...(state.pending ? {} : { completed_at: '2026-11-19T02:01:00Z' }),
      });
      return route.fulfill({
        json: {
          payment_id: paymentId,
          donation_id: donationId,
          refund_id: uuid(5),
          status: 'paid',
        },
      });
    }
    if (path === `/payments/${paymentId}/sync`) {
      state.syncs++;
      return route.fulfill({
        json: {
          payment_id: paymentId,
          donation_id: donationId,
          status: state.status,
        },
      });
    }
    if (path === '/payments' && state.ledgerError)
      return route.fulfill({ status: state.ledgerError });
    if (path === '/payments')
      return route.fulfill({
        json: [
          {
            id: paymentId,
            donation_id: donationId,
            amount: '100.00',
            currency: 'RUB',
            status: state.status,
            created_at: '2026-11-19T00:00:00Z',
            ...(state.status === 'paid'
              ? { paid_at: '2026-11-19T00:01:00Z' }
              : {}),
            provider_payment_id: state.provider,
          },
        ],
      });
    if (path === '/donations')
      return route.fulfill({
        json: [{ id: donationId, project_id: projectId }],
      });
    if (path === '/refunds') return route.fulfill({ json: state.refunds });
    if (path === '/projects')
      return route.fulfill({
        json: [{ id: projectId, name: 'Общее развитие ЗГУ' }],
      });
    return route.fulfill({ json: [] });
  });
  return state;
}

async function open(page: Page, signedIn = false) {
  await page.goto('/admin/');
  if (!signedIn) {
    await page.getByLabel('Рабочая почта').fill('admin@example.test');
    await page.getByLabel('Пароль', { exact: true }).fill('password-example');
    await page.getByRole('button', { name: 'Войти' }).click();
  }
  await page
    .getByRole('button', { name: 'Пожертвования', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Подробнее о платеже ' + paymentId })
    .click();
  return page.getByRole('dialog');
}

async function prepare(page: Page, amount?: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Оформить возврат' }).click();
  if (amount) await dialog.getByLabel('Сумма возврата, ₽').fill(amount);
  await dialog
    .getByLabel('Причина возврата')
    .fill('  Заявление жертвователя  ');
  await dialog.getByRole('button', { name: 'Проверить возврат' }).click();
  return dialog;
}

test.describe('administrator refunds', () => {
  test.skip(!enabled, 'Build with the payment API enabled.');
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-19T04:00:00Z') });
  });

  test('partial refund requires confirmation, sends exact rubles once and waits for actual bank data', async ({
    page,
  }) => {
    const state = await mock(page);
    state.delay = true;
    state.pending = true;
    const dialog = await open(page);
    await expect(
      dialog.getByRole('region', { name: 'Возврат платежа' }),
    ).toContainText(/80\s?₽/);
    await prepare(page, '10,25');
    expect(state.requests).toEqual([]);
    await expect(dialog.getByLabel(/секрет|код|пароль/i)).toHaveCount(0);
    const confirm = dialog.getByRole('button', {
      name: /^Подтвердить возврат/,
    });
    await confirm.evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
    await expect.poll(() => state.requests.length).toBe(1);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    expect(state.requests[0]).toEqual({
      amount: '10.25',
      reason: 'Заявление жертвователя',
    });
    state.release!();
    await expect(dialog).toContainText('Запрос на возврат отправлен');
    await expect(dialog).toContainText('Возврат в обработке');
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toHaveCount(0);
    state.refunds[1]!.status = 'completed';
    state.refunds[1]!.completed_at = '2026-11-19T02:01:00Z';
    await page.clock.fastForward(31000);
    const refund = dialog.getByRole('region', { name: 'Возврат платежа' });
    await expect(refund).toContainText(/30,25\s?₽/);
    await expect(refund).toContainText(/69,75\s?₽/);
    await expect(
      refund.getByRole('button', { name: 'Оформить возврат' }),
    ).toBeVisible();
    expect(state.requests).toHaveLength(1);
  });

  test('full refund defaults to the unpaid refund balance and stops after returning all funds', async ({
    page,
  }) => {
    const state = await mock(page);
    const dialog = await open(page);
    await prepare(page);
    await expect(
      dialog.getByRole('group', { name: 'Подтверждение возврата' }),
    ).toContainText(/80\s?₽/);
    await dialog.getByRole('button', { name: /^Подтвердить возврат/ }).click();
    await expect(dialog).toContainText('Вся сумма платежа уже возвращена');
    expect(state.requests).toEqual([
      { amount: '80.00', reason: 'Заявление жертвователя' },
    ]);
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toHaveCount(0);
  });

  test('invalid amounts and missing reasons never send a refund; server rejection keeps the draft', async ({
    page,
  }) => {
    const state = await mock(page);
    const dialog = await open(page);
    await prepare(page, '81');
    await expect(dialog.getByRole('alert')).toContainText(
      'Доступно к возврату',
    );
    await dialog.getByLabel('Сумма возврата, ₽').fill('0');
    await dialog.getByRole('button', { name: 'Проверить возврат' }).click();
    await expect(dialog.getByRole('alert')).toContainText('от 0,01');
    await dialog.getByLabel('Сумма возврата, ₽').fill('50');
    await dialog.getByLabel('Причина возврата').fill('   ');
    await dialog.getByRole('button', { name: 'Проверить возврат' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Укажите причину');
    expect(state.requests).toEqual([]);
    await dialog.getByLabel('Причина возврата').fill('Отказ банка');
    state.code = 400;
    await dialog.getByRole('button', { name: 'Проверить возврат' }).click();
    await dialog.getByRole('button', { name: /^Подтвердить возврат/ }).click();
    await expect(dialog.getByRole('alert')).toContainText(
      'Возврат отклонён банком',
    );
    await expect(dialog.getByLabel('Сумма возврата, ₽')).toHaveValue('50');
    expect(state.requests).toHaveLength(1);
    await expect(dialog).not.toContainText('Запрос на возврат отправлен');
  });

  test('ambiguous network errors do not retry and survive closing, reopening and reloading until a bank sync', async ({
    page,
  }) => {
    const state = await mock(page);
    state.drop = true;
    let dialog = await open(page);
    await prepare(page, '10');
    await dialog.getByRole('button', { name: /^Подтвердить возврат/ }).click();
    await expect(dialog.getByRole('alert')).toContainText('Сверьте платёж');
    await page.clock.fastForward(31000);
    expect(state.requests).toHaveLength(1);
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Подробнее о платеже ' + paymentId })
      .click();
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toHaveCount(0);
    dialog = await open(page, true);
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toHaveCount(0);
    state.ledgerError = 503;
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/v1/payments') &&
          response.status() === 503,
      ),
      dialog
        .getByRole('button', { name: 'Сверить с банком', exact: true })
        .click(),
    ]);
    await expect(
      dialog.getByRole('button', { name: 'Сверить с банком', exact: true }),
    ).toBeEnabled();
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toBeDisabled();
    state.ledgerError = 0;
    await dialog
      .getByRole('button', { name: 'Сверить с банком', exact: true })
      .click();
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toBeEnabled();
    await expect.poll(() => state.syncs).toBe(2);
    expect(state.requests).toHaveLength(1);
  });

  test('pending returns and unpaid payments cannot be refunded', async ({
    page,
  }) => {
    const state = await mock(page);
    state.refunds.push({
      id: uuid(6),
      payment_id: paymentId,
      amount: '10.00',
      status: 'pending',
      created_at: '2026-11-19T02:00:00Z',
    });
    let dialog = await open(page);
    await expect(dialog).toContainText(
      'Дождитесь завершения текущего возврата',
    );
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toHaveCount(0);
    state.refunds = [];
    for (const status of ['pending', 'failed', 'cancelled']) {
      state.status = status;
      dialog = await open(page, true);
      await expect(
        dialog.getByRole('button', { name: 'Оформить возврат' }),
      ).toHaveCount(0);
    }
    expect(state.requests).toEqual([]);
  });

  test('refund confirmation is accessible and fits a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await mock(page);
    const dialog = await open(page);
    await prepare(page, '10');
    const audit = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    expect(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
    await dialog.getByRole('button', { name: 'Изменить', exact: true }).click();
    await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: 'Оформить возврат' }),
    ).toBeVisible();
  });
});
