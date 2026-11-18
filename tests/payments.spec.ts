import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loadEnv } from 'vite';

const enabled =
  process.env.VITE_PAYMENTS_ENABLED === 'true' &&
  process.env.VITE_API_BASE_URL === '/api/v1';
const uuid = (n: number) =>
  `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const configuredMap = JSON.parse(
  process.env.VITE_DONATION_PROJECT_MAP ??
    loadEnv('production', process.cwd(), 'VITE_').VITE_DONATION_PROJECT_MAP ??
    '{}',
) as Record<string, string>;
const commonFundProject = configuredMap.fund;
const projectId = commonFundProject ?? uuid(1);
const paymentId = uuid(2);
const donationId = uuid(3);
const project = {
  id: projectId,
  name: 'Стипендии студентов',
  status: 'published',
  currency: 'RUB',
  target_amount: '100000.00',
  category: 'Образование',
  description: 'Поддержка талантов',
};
const checkout = {
  payment_id: paymentId,
  donation_id: donationId,
  order_id: '123456',
  payment_url: 'https://pay.best2pay.net/mock-checkout',
};
const checkoutPath = '/api/v1/payments/checkout';
const projectValue = `project:${projectId}`;

async function selectProject(page: Page) {
  await page
    .getByLabel('Направление поддержки')
    .selectOption(commonFundProject ? 'fund' : projectValue);
}

async function signIn(page: Page) {
  await page.goto('/admin/');
  await page.getByLabel('Рабочая почта').fill('staff@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('password-example');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
}

test('the main donation action preserves amount and shows the same site directions on checkout', async ({
  page,
}) => {
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ json: [project] }),
  );
  await page.goto('/projects/science/');
  await page
    .getByRole('button', { name: /Сделать вклад/ })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('button', { name: 'Другая сумма', exact: true })
    .click();
  await dialog.getByLabel('Другая сумма, рублей').fill('2020000');
  await dialog.getByRole('link', { name: 'Перейти к оформлению' }).click();
  await expect(page).toHaveURL(
    /\/donate\/\?target=direction%3Ascience&amount=2020000$/,
  );
  await expect(page.getByLabel('Сумма, ₽')).toHaveValue('2.020.000');
  await expect(page.getByLabel('Направление поддержки')).toHaveValue(
    'direction:science',
  );
  await expect(page.getByLabel('Детали пожертвования')).toContainText(
    'Наука и инженерия для Арктики',
  );
  for (const name of [
    'Общее развитие университета',
    'Стипендии для талантов',
    'Наука и инженерия для Арктики',
    'Инфраструктура для развития',
    'Связь выпускников',
  ])
    await expect(
      page
        .locator('#payment-target')
        .getByRole('option', { name, exact: true }),
    ).toHaveCount(1);
  if (enabled)
    await expect(
      page.getByRole('button', { name: 'Перейти к оплате' }),
    ).toBeEnabled();
});

test('the amount groups digits immediately, rejects text and accepts only 100 rubles or more', async ({
  page,
}) => {
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ json: [project] }),
  );
  await page.goto('/donate/');
  const amount = page.getByLabel('Сумма, ₽');
  await expect(amount).toHaveAttribute('inputmode', 'numeric');
  await amount.fill('');
  await amount.pressSequentially('1234567');
  await expect(amount).toHaveValue('1.234.567');
  await amount.pressSequentially('abcе+-₽');
  await expect(amount).toHaveValue('1.234.567');
  await amount.fill('2500,50');
  await expect(amount).toHaveValue('1.234.567');
  await amount.fill('1 234 567');
  await expect(amount).toHaveValue('1.234.567');
  await amount.evaluate((input: HTMLInputElement) =>
    input.setSelectionRange(3, 3),
  );
  await amount.press('a');
  expect(
    await amount.evaluate((input: HTMLInputElement) => input.selectionStart),
  ).toBe(3);
  await amount.press('9');
  await expect(amount).toHaveValue('12.934.567');
  await amount.press('Backspace');
  await expect(amount).toHaveValue('1.234.567');
  await amount.fill('');
  await amount.pressSequentially('1000000000');
  await expect(amount).toHaveValue('1.000.000.000');
  await amount.fill('99');
  await amount.blur();
  await expect(amount).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Укажите целую сумму от 100 ₽.')).toBeVisible();
  await amount.fill('100');
  await amount.blur();
  await expect(amount).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('.payment-total')).toHaveText(/100\s?₽/);
});

test('checkout and its recurring placeholder fit mobile and have accessible controls', async ({
  page,
}) => {
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ json: [project] }),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/donate/');
  await expect(
    page.getByRole('group', { name: 'Способ оплаты' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  const audit = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole('button', { name: 'Ежемесячно', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Ежемесячные пожертвования скоро появятся',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Перейти к оплате' }),
  ).toHaveCount(0);
});

test.describe('actual server payment contract', () => {
  test.skip(
    !enabled,
    'Build with VITE_API_BASE_URL=/api/v1 and VITE_PAYMENTS_ENABLED=true.',
  );

  test('database projects stay visible alongside all five directions in both donation selectors', async ({
    page,
  }) => {
    const otherId = uuid(678);
    const other = {
      ...project,
      id: otherId,
      name: 'Исследовательская лаборатория',
    };
    const requests: Record<string, unknown>[] = [];
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return route.fulfill({ status: 503 });
      }
      return route.fulfill({
        json: [project, other, { ...project, id: uuid(679), status: 'draft' }],
      });
    });
    await page.goto('/donate/?target=direction:science');
    const select = page.getByLabel('Направление поддержки');
    const databaseOptions = page.locator(
      '#payment-target optgroup[label="Проекты фонда"] option',
    );
    await expect(databaseOptions).toHaveText([project.name, other.name]);
    await expect(
      page.locator(
        '#payment-target optgroup[label="Направления поддержки"] option',
      ),
    ).toHaveCount(5);
    await select.selectOption(`project:${otherId}`);
    await expect(page.getByLabel('Детали пожертвования')).toContainText(
      other.name,
    );
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByRole('alert')).toContainText('временно недоступен');
    expect(requests).toHaveLength(1);
    expect(requests[0]!.project_id).toBe(otherId);

    await page.goto('/projects/science/');
    await page
      .getByRole('button', { name: /Сделать вклад/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('combobox', { name: 'Направление поддержки' })
      .click();
    const options = page.getByRole('listbox', {
      name: 'Направления поддержки',
    });
    await expect(options.getByRole('option')).toHaveCount(7);
    await options
      .getByRole('option', { name: project.name, exact: true })
      .click();
    await expect(
      dialog.getByRole('combobox', { name: 'Направление поддержки' }),
    ).toHaveText(project.name);
    const checkoutLink = dialog.getByRole('link', {
      name: 'Перейти к оформлению',
    });
    const href = new URL(
      (await checkoutLink.getAttribute('href'))!,
      'http://127.0.0.1:4173',
    );
    expect(href.searchParams.get('target')).toBe(projectValue);
    const enquiry = new URL(
      (await dialog
        .getByRole('link', { name: 'Обсудить участие по почте' })
        .getAttribute('href'))!,
    );
    expect(enquiry.searchParams.get('body')).toContain(project.name);
    await checkoutLink.click();
    await expect(page.getByLabel('Направление поддержки')).toHaveValue(
      projectValue,
    );
    await expect(page.getByLabel('Детали пожертвования')).toContainText(
      project.name,
    );
    expect(requests).toHaveLength(1);
  });

  test('all five directions use the configured common fund and remain visible in the summary', async ({
    page,
  }) => {
    test.skip(
      !commonFundProject,
      'Configure VITE_DONATION_PROJECT_MAP.fund for a shared fund.',
    );
    const requests: Record<string, unknown>[] = [];
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return route.fulfill({ status: 503 });
      }
      return route.fulfill({ json: [project] });
    });
    await page.goto('/donate/');
    await expect(page.getByLabel('Направление поддержки')).toHaveValue('fund');
    await page.getByLabel('Принимаю условия публичной оферты').check();
    for (const [index, [value, label]] of [
      ['fund', 'Общее развитие университета'],
      ['direction:students', 'Стипендии для талантов'],
      ['direction:science', 'Наука и инженерия для Арктики'],
      ['direction:campus', 'Инфраструктура для развития'],
      ['direction:alumni', 'Связь выпускников'],
    ].entries()) {
      await page.getByLabel('Направление поддержки').selectOption(value!);
      await expect(page.getByLabel('Детали пожертвования')).toContainText(
        label!,
      );
      await page.getByRole('button', { name: 'Перейти к оплате' }).click();
      await expect(page.getByRole('alert')).toContainText(
        'временно недоступен',
      );
      expect(requests).toHaveLength(index + 1);
      expect(requests[index]!.project_id).toBe(commonFundProject);
    }
  });

  test('an unavailable mapped fund focuses the selection and explains the missing collection without creating a payment', async ({
    page,
  }) => {
    test.skip(
      !commonFundProject,
      'Configure a shared fund for the unavailable-project check.',
    );
    let writes = 0;
    await page.route('**/api/v1/**', (route) => {
      if (route.request().method() === 'POST') writes++;
      return route.fulfill({ json: [{ ...project, id: uuid(999) }] });
    });
    await page.goto('/donate/?target=direction:students');
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByRole('alert')).toContainText('сбор пока недоступен');
    await expect(page.getByLabel('Направление поддержки')).toBeFocused();
    await expect(page.getByLabel('Направление поддержки')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(writes).toBe(0);
    await page
      .getByLabel('Направление поддержки')
      .selectOption(`project:${uuid(999)}`);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('retry sends the actual decimal-ruble body with a stable key, then shows the successful bank return', async ({
    page,
  }) => {
    const requests: Record<string, unknown>[] = [];
    const privateReads: string[] = [];
    await page.route('**/api/v1/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return requests.length === 1
          ? route.fulfill({ status: 503 })
          : route.fulfill({ json: checkout });
      }
      if (/\/payments\//.test(path)) privateReads.push(path);
      return route.fulfill({
        json: path.endsWith('/projects') ? [project] : [],
      });
    });
    await page.route(checkout.payment_url, (route) =>
      route.fulfill({
        status: 302,
        headers: {
          location:
            'http://127.0.0.1:4173/payment/success/?id=123456&status=succeeded',
        },
      }),
    );
    await page.goto('/donate/?target=direction:science');
    await selectProject(page);
    await page.getByLabel('Сумма, ₽').fill('2500');
    await page.getByLabel(/Электронная почта/).fill('donor@example.test');
    await page.getByLabel('Принимаю условия публичной оферты').check();
    const submit = page.getByRole('button', { name: 'Перейти к оплате' });
    await submit.click();
    expect(requests).toHaveLength(0);
    await page
      .getByLabel('Даю согласие на обработку персональных данных')
      .check();
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('временно недоступен');
    await submit.click();
    await expect(
      page.getByRole('heading', { name: 'Оплата прошла успешно' }),
    ).toBeVisible();
    await expect(page.locator('.payment-result-reference')).toContainText(
      '123456',
    );
    await expect(page.locator('.payment-result')).toHaveAttribute(
      'data-status-source',
      'bank-return',
    );
    await expect(page.locator('.payment-result')).not.toContainText('Получено');
    expect(requests).toHaveLength(2);
    expect(requests[0]).toEqual({
      project_id: projectId,
      amount: '2500.00',
      currency: 'RUB',
      method: 'card',
      idempotency_key: expect.stringMatching(/^[a-f0-9-]{36}$/),
      is_anonymous: true,
      donor_email: 'donor@example.test',
      offer_version: expect.stringMatching(/^text-sha256:[a-f0-9]{64}$/),
      offer_accepted_at: expect.any(String),
    });
    expect(
      Number.isFinite(Date.parse(String(requests[0]!.offer_accepted_at))),
    ).toBe(true);
    expect(requests[1]).toEqual(requests[0]);
    expect(privateReads).toEqual([]);
    await expect(
      page.getByRole('button', { name: 'Проверить статус' }),
    ).toHaveCount(0);
    const stored = await page.evaluate(() =>
      sessionStorage.getItem('zgu:checkout:/api/v1'),
    );
    expect(stored).not.toContain('donor@');
    expect(JSON.parse(stored!).paymentId).toBe(paymentId);
  });

  test('a transient processor disconnect retries checkout once with the identical request', async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return requests.length === 1
          ? route.fulfill({
              status: 503,
              json: { error: 'Платёжный сервис недоступен' },
            })
          : route.fulfill({ json: checkout });
      }
      return route.fulfill({ json: [project] });
    });
    await page.route(checkout.payment_url, (route) =>
      route.fulfill({
        status: 302,
        headers: {
          location: 'http://127.0.0.1:4173/payment/success/?id=123456',
        },
      }),
    );
    await page.goto(`/donate/?target=project:${projectId}`);
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(
      page.getByRole('heading', { name: 'Оплата прошла успешно' }),
    ).toBeVisible();
    expect(requests).toHaveLength(2);
    expect(requests[1]).toEqual(requests[0]);
  });

  test('processor retries are bounded and manual retry keeps the same payment attempt', async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return route.fulfill({
          status: 503,
          json: { error: 'Платёжный сервис недоступен' },
        });
      }
      return route.fulfill({ json: [project] });
    });
    await page.goto(`/donate/?target=project:${projectId}`);
    await page.getByLabel('Принимаю условия публичной оферты').check();
    const submit = page.getByRole('button', { name: 'Перейти к оплате' });
    await submit.click();
    await expect(page.getByRole('alert')).toContainText(
      'Связь с платёжным сервисом прервалась',
    );
    expect(requests).toHaveLength(2);
    await submit.click();
    await expect(submit).toBeEnabled();
    await expect.poll(() => requests.length).toBe(4);
    for (const body of requests) expect(body).toEqual(requests[0]);
  });

  test('service configuration errors do not trigger automatic checkout retry', async ({
    page,
  }) => {
    let writes = 0;
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        writes++;
        return route.fulfill({
          status: 503,
          json: { error: 'Платёжный сервис не настроен' },
        });
      }
      return route.fulfill({ json: [project] });
    });
    await page.goto(`/donate/?target=project:${projectId}`);
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByRole('alert')).toContainText('временно недоступен');
    expect(writes).toBe(1);
  });

  test('only open RUB projects can be chosen; SBP and a fresh key are sent after changing a draft', async ({
    page,
  }) => {
    const requests: Record<string, unknown>[] = [];
    await page.route('**/api/v1/**', (route) => {
      if (new URL(route.request().url()).pathname === checkoutPath) {
        requests.push(route.request().postDataJSON());
        return route.fulfill({
          status: 409,
          json: { error: 'Попытка завершена. Измените данные.' },
        });
      }
      return route.fulfill({
        json: [
          project,
          { ...project, id: uuid(10), status: 'completed' },
          { ...project, id: uuid(11), status: 'draft' },
          { ...project, id: uuid(12), currency: 'USD' },
        ],
      });
    });
    await page.goto(`/donate/?target=project:${projectId}`);
    await expect(page.getByLabel('Направление поддержки')).toHaveValue(
      projectValue,
    );
    await expect(page.locator('#payment-target option')).toHaveCount(7);
    await page.getByRole('button', { name: 'СБП', exact: true }).click();
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'Попытка завершена. Измените данные.',
    );
    await page.getByLabel('Сумма, ₽').fill('100');
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[0]!.method).toBe('sbp');
    expect(requests[0]).not.toHaveProperty('donor_email');
    expect(requests[1]!.amount).toBe('100.00');
    expect(requests[1]!.idempotency_key).not.toBe(requests[0]!.idempotency_key);
  });

  test('empty projects, amounts below minimum and unsafe redirect URLs never lead to a bank payment', async ({
    page,
  }) => {
    let available = false;
    let writes = 0;
    await page.route('**/api/v1/**', (route) => {
      if (route.request().method() === 'POST') {
        writes++;
        return route.fulfill({
          json: {
            ...checkout,
            payment_url: 'https://untrusted.example/checkout',
          },
        });
      }
      return route.fulfill({ json: available ? [project] : [] });
    });
    await page.goto('/donate/');
    await expect(
      page.getByText('Открытых сборов пока нет.', { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Перейти к оплате' }),
    ).toBeDisabled();
    available = true;
    await page.reload();
    await selectProject(page);
    await page.getByLabel('Принимаю условия публичной оферты').check();
    await page.getByLabel('Сумма, ₽').fill('99');
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByLabel('Сумма, ₽')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(writes).toBe(0);
    await page.getByLabel('Сумма, ₽').fill('100');
    await page.getByRole('button', { name: 'Перейти к оплате' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    expect(writes).toBe(1);
    await expect(page).toHaveURL(/\/donate\/$/);
  });

  test('a missing payment reference or forged status query does not override the return screen', async ({
    page,
  }) => {
    const reads: string[] = [];
    await page.route('**/api/v1/**', (route) => {
      reads.push(route.request().url());
      return route.fulfill({ status: 403 });
    });
    await page.goto('/donate/success/?status=succeeded');
    await expect(
      page.getByRole('heading', { name: 'Не удалось определить платёж' }),
    ).toBeVisible();
    await page.goto(
      `/payment/fail/?payment_id=${paymentId}&id=123456&status=paid`,
    );
    await expect(
      page.getByRole('heading', { name: 'Платёж не прошёл' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Пожертвование принято' }),
    ).toHaveCount(0);
    expect(reads).toEqual([]);
  });

  for (const [path, succeeded] of [
    ['/payment/success/', true],
    ['/payment/fail/', false],
    ['/donate/success/', true],
    ['/donate/failure/', false],
  ] as const) {
    test(`public return ${path} shows its screen without reading or updating financial records`, async ({
      page,
    }) => {
      const calls: string[] = [];
      await page.route('**/api/v1/**', (route) => {
        calls.push(route.request().method() + ' ' + route.request().url());
        return route.fulfill({ status: 403 });
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(
        `${path}?id=123456&status=${succeeded ? 'failed' : 'paid'}`,
      );
      await expect(
        page.getByRole('heading', {
          name: succeeded ? 'Оплата прошла успешно' : 'Платёж не прошёл',
        }),
      ).toBeVisible();
      const result = page.locator('.payment-result');
      await expect(result).toHaveAttribute(
        'data-status',
        succeeded ? 'succeeded' : 'failed',
      );
      await expect(result).toHaveAttribute('data-status-source', 'bank-return');
      await expect(result).not.toContainText('Получено');
      await expect(
        page.getByRole('heading', { name: 'Ожидаем подтверждения' }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('link', { name: 'Попробовать ещё раз' }),
      ).toHaveCount(succeeded ? 0 : 1);
      const audit = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(audit.violations).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
      expect(calls).toEqual([]);
    });
  }

  test('a return for a different order or payment does not reuse the saved checkout', async ({
    page,
  }) => {
    await page.addInitScript(
      ({ checkout, amountMinor }) => {
        sessionStorage.setItem(
          'zgu:checkout:/api/v1',
          JSON.stringify({
            paymentId: checkout.payment_id,
            donationId: checkout.donation_id,
            orderId: checkout.order_id,
            amountMinor,
            createdAt: new Date().toISOString(),
          }),
        );
      },
      { checkout, amountMinor: 250000 },
    );
    let calls = 0;
    await page.route('**/api/v1/**', (route) => {
      calls++;
      return route.fulfill({ status: 403 });
    });
    for (const query of ['id=999999', `id=123456&payment_id=${uuid(999)}`]) {
      await page.goto(`/payment/success/?${query}`);
      await expect(
        page.getByRole('heading', { name: 'Не удалось определить платёж' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Оплата прошла успешно' }),
      ).toHaveCount(0);
    }
    expect(calls).toBe(0);
  });

  test('a successful return is displayed while staff confirmation catches up, then verified funds are shown', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem('zgu:staff-session:/api/v1', 'active'),
    );
    await page.clock.install();
    let reads = 0;
    await page.route(`**/api/v1/payments/${paymentId}`, (route) =>
      route.fulfill({
        json: {
          id: paymentId,
          status: ++reads === 1 ? 'pending' : 'paid',
          amount: '2500.00',
          currency: 'RUB',
        },
      }),
    );
    await page.goto(`/payment/success/?payment_id=${paymentId}`);
    await expect(
      page.getByRole('heading', { name: 'Оплата прошла успешно' }),
    ).toBeVisible();
    await expect.poll(() => reads).toBe(1);
    await expect(page.locator('.payment-result')).toHaveAttribute(
      'data-status-source',
      'bank-return',
    );
    await page.clock.fastForward(4100);
    await expect(
      page.getByRole('heading', { name: 'Пожертвование принято' }),
    ).toBeVisible();
    await expect(page.locator('.payment-result')).toHaveAttribute(
      'data-status-source',
      'api',
    );
    await expect(page.locator('.payment-result')).toContainText(
      /Получено\s+2\s500/,
    );
  });

  for (const status of ['paid', 'failed'] as const) {
    test(`an authenticated staff member sees the verified ${status} result regardless of URL`, async ({
      page,
    }) => {
      await page.addInitScript(() =>
        sessionStorage.setItem('zgu:staff-session:/api/v1', 'active'),
      );
      await page.route(`**/api/v1/payments/${paymentId}`, (route) =>
        route.fulfill({
          json: { id: paymentId, status, amount: '2500.00', currency: 'RUB' },
        }),
      );
      await page.goto(
        `/payment/${status === 'paid' ? 'fail' : 'success'}/?payment_id=${paymentId}`,
      );
      await expect(
        page.getByRole('heading', {
          name:
            status === 'paid' ? 'Пожертвование принято' : 'Платёж не прошёл',
        }),
      ).toBeVisible();
      await expect(page).toHaveURL(
        new RegExp(`/donate/${status === 'paid' ? 'success' : 'failure'}/`),
      );
    });
  }

  test('expired staff access stops status polling', async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem('zgu:staff-session:/api/v1', 'active'),
    );
    await page.clock.install();
    let reads = 0;
    await page.route(`**/api/v1/payments/${paymentId}`, (route) => {
      reads++;
      return route.fulfill({ status: 401 });
    });
    await page.goto(`/donate/success/?payment_id=${paymentId}`);
    await expect(
      page.getByRole('heading', { name: 'Оплата прошла успешно' }),
    ).toBeVisible();
    await page.clock.fastForward(15_000);
    expect(reads).toBe(1);
    await expect(
      page.getByRole('button', { name: 'Проверить статус' }),
    ).toHaveCount(0);
  });

  test('project goals refresh from the public API without inventing collected totals or reading private payments', async ({
    page,
  }) => {
    let target = '100000.00';
    const privateReads: string[] = [];
    await page.clock.install();
    await page.route('**/api/v1/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      if (/donations|payments|refunds/.test(path)) privateReads.push(path);
      if (path.endsWith('/projects'))
        return route.fulfill({ json: [{ ...project, target_amount: target }] });
      return route.fulfill({ json: [] });
    });
    await page.goto('/projects/');
    const card = page
      .locator('.published-card')
      .filter({ hasText: project.name });
    await expect(card).toContainText(/100\s000\s?₽/);
    await expect(card.getByRole('progressbar')).toHaveCount(0);
    await expect(card).toContainText(
      'Информация о поступлениях уточняется фондом.',
    );
    target = '200000.00';
    await page.clock.fastForward(21_000);
    await expect(card).toContainText(/200\s000\s?₽/);
    expect(privateReads).toEqual([]);
  });

  test('admin analytics use actual lists, paid dates and completed refunds, with filters and sync', async ({
    page,
  }) => {
    await page.clock.install({ time: new Date('2026-11-18T08:00:00Z') });
    const secondProjectId = uuid(50);
    const secondDonationId = uuid(51);
    const secondProjectName = 'Научная лаборатория';
    const payments = [
      {
        id: uuid(21),
        donation_id: donationId,
        amount: '1000.00',
        currency: 'RUB',
        status: 'paid',
        created_at: '2026-11-18T01:00:00Z',
        paid_at: '2026-11-18T01:01:00Z',
        provider_payment_id: '21',
      },
      {
        id: uuid(22),
        donation_id: donationId,
        amount: '200.00',
        currency: 'RUB',
        status: 'pending',
        created_at: '2026-11-18T02:00:00Z',
        paid_at: '',
        provider_payment_id: '22',
      },
      {
        id: uuid(23),
        donation_id: donationId,
        amount: '300.00',
        currency: 'RUB',
        status: 'failed',
        created_at: '2026-11-18T03:00:00Z',
        paid_at: '',
        provider_payment_id: '23',
      },
      {
        id: uuid(24),
        donation_id: donationId,
        amount: '400.00',
        currency: 'RUB',
        status: 'cancelled',
        created_at: '2026-10-31T19:00:00Z',
        paid_at: '2026-10-31T20:00:00Z',
        provider_payment_id: '24',
      },
      {
        id: uuid(25),
        donation_id: donationId,
        amount: '500.00',
        currency: 'EUR',
        status: 'paid',
        created_at: '2026-11-01T00:00:00Z',
        paid_at: '2026-11-01T00:00:00Z',
        provider_payment_id: '25',
      },
      {
        id: uuid(26),
        donation_id: secondDonationId,
        amount: '600.00',
        currency: 'RUB',
        status: 'paid',
        created_at: '2026-10-01T00:00:00Z',
        paid_at: '2026-10-01T00:00:00Z',
        provider_payment_id: '26',
      },
      ...Array.from({ length: 12 }, (_, i) => ({
        id: uuid(100 + i),
        donation_id: donationId,
        amount: '100.00',
        currency: 'RUB',
        status: 'pending',
        created_at: '2026-11-17T00:00:00Z',
        paid_at: '',
        provider_payment_id: '',
      })),
    ];
    const refunds = [
      {
        id: uuid(31),
        payment_id: uuid(21),
        amount: '250.00',
        status: 'completed',
        completed_at: '2026-11-18T05:00:00Z',
      },
      {
        id: uuid(32),
        payment_id: uuid(24),
        amount: '400.00',
        status: 'completed',
        completed_at: '2026-11-01T00:00:00Z',
      },
      {
        id: uuid(33),
        payment_id: uuid(21),
        amount: '999.00',
        status: 'pending',
      },
      {
        id: uuid(34),
        payment_id: uuid(21),
        amount: '999.00',
        status: 'failed',
      },
      {
        id: uuid(35),
        payment_id: uuid(100),
        amount: '100.00',
        status: 'completed',
        completed_at: '2026-11-18T05:00:00Z',
      },
    ];
    let syncs = 0;
    let paymentReads = 0;
    let expired = false;
    await page.route('**/api/v1/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      if (expired) return route.fulfill({ status: 401 });
      if (path.endsWith('/me'))
        return route.fulfill({
          json: {
            id: uuid(99),
            email: 'staff@example.test',
            role: 'admin',
            is_active: true,
          },
        });
      if (path.endsWith('/login')) return route.fulfill({ status: 204 });
      if (path === `/api/v1/payments/${uuid(26)}/sync`)
        return route.fulfill({ status: 502 });
      if (path === `/api/v1/payments/${uuid(22)}/sync`) {
        syncs++;
        payments[1]!.status = 'paid';
        payments[1]!.paid_at = '2026-11-18T02:01:00Z';
        return route.fulfill({
          json: { payment_id: uuid(22), status: 'paid' },
        });
      }
      if (path.endsWith('/payments')) {
        paymentReads++;
        return route.fulfill({ json: [...payments, payments[0]] });
      }
      if (path.endsWith('/donations'))
        return route.fulfill({
          json: [
            {
              id: donationId,
              project_id: projectId,
              donor_snapshot: { email: 'private@example.test' },
            },
            { id: secondDonationId, project_id: secondProjectId },
          ],
        });
      if (path.endsWith('/refunds'))
        return route.fulfill({ json: [...refunds, refunds[0]] });
      return route.fulfill({
        json: path.endsWith('/projects')
          ? [
              project,
              { ...project, id: secondProjectId, name: secondProjectName },
            ]
          : [],
      });
    });
    await signIn(page);
    await page
      .getByRole('button', { name: 'Пожертвования', exact: true })
      .click();
    const workspace = page.locator('.payments-workspace');
    const kpis = workspace.locator('.payment-kpis');
    await expect(
      kpis.locator('div').filter({ hasText: 'Поступило в этом месяце' }),
    ).toContainText(/1\s400\s?₽/);
    await expect(
      kpis.locator('div').filter({ hasText: 'За период с учётом возвратов' }),
    ).toContainText(/1\s350\s?₽/);
    await expect(
      kpis.locator('div').filter({ hasText: 'Возвращено за период' }),
    ).toContainText(/650\s?₽/);
    await expect(
      kpis
        .locator('div')
        .filter({ hasText: 'Оплаченных платежей за период' })
        .locator('.payment-kpi-value'),
    ).toHaveText('3');
    await expect(workspace).not.toContainText('private@example.test');
    const chart = page.getByRole('region', { name: 'Динамика поступлений' });
    await expect(chart.getByRole('listitem')).toHaveCount(6);
    await page
      .getByRole('combobox', { name: 'Период', exact: true })
      .selectOption('3');
    await expect(chart.getByRole('listitem')).toHaveCount(3);
    const search = page.getByLabel('Поиск платежей');
    await search.fill(secondProjectName);
    const ledgerRows = page.locator('.payment-table tbody tr');
    await expect(ledgerRows).toHaveCount(1);
    await expect(ledgerRows).toContainText('№ 26');
    await expect(ledgerRows).not.toContainText(project.name);
    await page
      .getByRole('button', {
        name: `Подробнее о платеже ${uuid(26)}`,
        exact: true,
      })
      .click();
    const detail = page.getByRole('dialog');
    await expect(detail).toContainText(secondProjectName);
    await expect(detail).toContainText(secondProjectId);
    await expect(detail).toContainText(secondDonationId);
    await detail
      .getByRole('button', { name: 'Сверить с банком', exact: true })
      .click();
    await expect(detail.getByRole('alert')).toContainText(
      'API фонда не смог выполнить запрос',
    );
    const detailAudit = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(detailAudit.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await search.fill('21');
    await expect(ledgerRows).toHaveCount(1);
    await expect(ledgerRows).toContainText(project.name);
    await expect(workspace.locator('.payments-project-note')).toHaveCount(0);
    await expect(workspace).not.toContainText(
      'Общий сбор для пяти направлений',
    );
    await search.fill(secondDonationId);
    await expect(ledgerRows).toHaveCount(1);
    await expect(ledgerRows).toContainText(secondProjectName);
    await search.fill('');
    await chart.getByRole('button', { name: /^октябрь 2026/ }).click();
    await expect(ledgerRows).toHaveCount(1);
    await expect(ledgerRows).toContainText(secondProjectName);
    await page
      .getByRole('button', { name: 'Показать все месяцы периода' })
      .click();
    await expect(
      page.getByRole('table', { name: 'Реестр платежей' }).locator('tbody tr'),
    ).toHaveCount(10);
    await page
      .getByRole('navigation', { name: 'Страницы платежей' })
      .getByRole('button', { name: 'Далее' })
      .click();
    await expect(
      page.getByRole('navigation', { name: 'Страницы платежей' }),
    ).toContainText('2 / 2');
    await page
      .getByRole('combobox', { name: 'Статус платежа', exact: true })
      .selectOption('failed');
    await expect(page.locator('.payment-table tbody tr')).toHaveCount(1);
    await page
      .getByRole('combobox', { name: 'Статус платежа', exact: true })
      .selectOption('pending');
    await page
      .getByRole('button', { name: `Сверить платёж ${uuid(22)}`, exact: true })
      .click();
    await expect(
      kpis.locator('div').filter({ hasText: 'Поступило в этом месяце' }),
    ).toContainText(/1\s600\s?₽/);
    expect(syncs).toBe(1);
    expect(paymentReads).toBeGreaterThanOrEqual(2);
    const audit = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    for (const width of [320, 390, 768, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileAudit = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(mobileAudit.violations).toEqual([]);
    expired = true;
    await workspace
      .getByRole('button', { name: 'Обновить', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Вход в панель' }),
    ).toBeVisible();
  });

  test('moderators do not see the administrator analytics tab', async ({
    page,
  }) => {
    let reads = 0;
    await page.route('**/api/v1/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      if (/payments|donations|refunds/.test(path)) reads++;
      if (path.endsWith('/me'))
        return route.fulfill({
          json: {
            id: uuid(99),
            email: 'staff@example.test',
            role: 'moderator',
            is_active: true,
          },
        });
      if (path.endsWith('/login')) return route.fulfill({ status: 204 });
      return route.fulfill({ json: [] });
    });
    await signIn(page);
    await expect(
      page.getByRole('button', { name: 'Пожертвования', exact: true }),
    ).toHaveCount(0);
    expect(reads).toBe(0);
  });
});
