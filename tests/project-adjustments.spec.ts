import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loadEnv } from 'vite';
import { defaultDonationProjectId } from '../src/constants/donation-fund';

const enabled = process.env.VITE_API_BASE_URL === '/api/v1';
const map = JSON.parse(
  process.env.VITE_DONATION_PROJECT_MAP ??
    loadEnv('production', process.cwd(), 'VITE_').VITE_DONATION_PROJECT_MAP ??
    '{}',
);
const projectId = map.fund ?? defaultDonationProjectId;
const actor = '10000000-0000-4000-8000-000000000111';
const first = '10000000-0000-4000-8000-000000000112';
const second = '10000000-0000-4000-8000-000000000113';
type Adjustment = {
  id: string;
  project_id: string;
  amount: string;
  comment: string;
  created_by: string;
  created_at: string;
};

async function mockApi(page: Page, role = 'admin') {
  const state = {
    signed: false,
    currentMinor: 202000000,
    listError: 0,
    createError: 0,
    dropResponse: false,
    adjustments: [
      {
        id: first,
        project_id: projectId,
        amount: '2000000.00',
        comment: 'Перевод партнёра по платёжному поручению',
        created_by: actor,
        created_at: '2026-11-18T07:00:00Z',
      },
    ] as Adjustment[],
    writes: [] as {
      method: string;
      path: string;
      body?: Record<string, string>;
    }[],
  };
  const project = () => ({
    id: projectId,
    name: 'Общее развитие ЗГУ',
    description: 'Развитие университета',
    category: 'Общее',
    status: 'published',
    currency: 'RUB',
    target_amount: '100000000.00',
    current_amount: (state.currentMinor / 100).toFixed(2),
  });
  await page.route('**/api/v1/**', (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace('/api/v1', '');
    if (path === '/login') {
      state.signed = true;
      return route.fulfill({ json: { role } });
    }
    if (path === '/me')
      return state.signed
        ? route.fulfill({
            json: {
              id: actor,
              role,
              is_active: true,
              email: 'editor@example.test',
            },
          })
        : route.fulfill({ status: 401 });
    if (path === `/projects/${projectId}/adjustments` && req.method() === 'GET')
      return state.listError
        ? route.fulfill({ status: state.listError })
        : route.fulfill({ json: state.adjustments });
    if (
      path.startsWith(`/projects/${projectId}/adjustments`) &&
      req.method() !== 'GET'
    ) {
      const body = req.method() === 'POST' ? req.postDataJSON() : undefined;
      state.writes.push({ method: req.method(), path, body });
      if (role !== 'admin') return route.fulfill({ status: 403 });
      if (req.method() === 'POST') {
        if (state.createError)
          return route.fulfill({
            status: state.createError,
            json: { error: 'Нет доступа к пополнениям' },
          });
        state.adjustments.push({
          id: second,
          project_id: projectId,
          amount: body.amount,
          comment: body.comment,
          created_by: actor,
          created_at: '2026-11-18T08:00:00Z',
        });
        state.currentMinor += Math.round(Number(body.amount) * 100);
        if (state.dropResponse) return route.abort('failed');
        return route.fulfill({ status: 201, json: state.adjustments.at(-1) });
      }
      const row = state.adjustments.find((a) => path.endsWith('/' + a.id));
      if (row) state.currentMinor -= Math.round(Number(row.amount) * 100);
      state.adjustments = state.adjustments.filter((a) => a !== row);
      return route.fulfill({ status: 204 });
    }
    if (req.method() !== 'GET')
      state.writes.push({
        method: req.method(),
        path,
        body: req.postDataJSON(),
      });
    if (path === '/projects') return route.fulfill({ json: [project()] });
    if (path === `/projects/${projectId}`)
      return route.fulfill({ json: project() });
    return route.fulfill({ json: [] });
  });
  return state;
}

async function open(page: Page) {
  await page.goto('/moderator/');
  await page.getByLabel('Рабочая почта').fill('editor@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('password-example');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('button', { name: 'Проекты', exact: true }).click();
  await page.getByRole('button', { name: /Общее развитие ЗГУ/ }).click();
  const panel = page.getByRole('region', { name: 'Ручные пополнения' });
  await expect(panel).toBeVisible();
  return panel;
}

test.describe('new project adjustments contract', () => {
  test.skip(!enabled, 'Build with VITE_API_BASE_URL=/api/v1.');

  test('administrator adds and removes manual entries, then public funding reads the server balance', async ({
    page,
  }) => {
    const state = await mockApi(page);
    const panel = await open(page);
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s020\s000\s?₽/,
    );
    await panel.getByLabel('Сумма пополнения, RUB').fill('123456,78');
    await expect(panel.getByLabel('Сумма пополнения, RUB')).toHaveValue(
      '123.456,78',
    );
    await panel
      .getByLabel('Комментарий к пополнению')
      .fill('  Перевод по поручению № 42  ');
    await panel.getByRole('button', { name: 'Добавить пополнение' }).click();
    await expect(panel).toContainText('Ручное пополнение добавлено.');
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s143\s456,78\s?₽/,
    );
    expect(state.writes).toEqual([
      {
        method: 'POST',
        path: `/projects/${projectId}/adjustments`,
        body: { amount: '123456.78', comment: 'Перевод по поручению № 42' },
      },
    ]);
    const entry = panel
      .getByRole('listitem')
      .filter({ hasText: 'Перевод по поручению № 42' });
    await entry.getByRole('button', { name: /^Удалить пополнение/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Отмена' })
      .click();
    expect(state.writes).toHaveLength(1);
    await entry.getByRole('button', { name: /^Удалить пополнение/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Удалить пополнение', exact: true })
      .click();
    await expect(panel).toContainText('Ручное пополнение удалено.');
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s020\s000\s?₽/,
    );
    expect(state.writes[1]).toMatchObject({
      method: 'DELETE',
      path: `/projects/${projectId}/adjustments/${second}`,
    });
    await expect(panel.getByRole('listitem')).toHaveCount(1);
    await page.goto('/');
    await expect(
      page.getByRole('group', { name: 'Сбор целевого капитала' }),
    ).toContainText('2 020 000 рублей');
  });

  test('moderator sees the history but cannot add or delete entries', async ({
    page,
  }) => {
    const state = await mockApi(page, 'moderator');
    const panel = await open(page);
    await expect(panel.getByRole('listitem')).toHaveCount(1);
    await expect(panel).toContainText(
      'Перевод партнёра по платёжному поручению',
    );
    await expect(
      panel.getByRole('button', { name: 'Добавить пополнение' }),
    ).toHaveCount(0);
    await expect(
      panel.getByRole('button', { name: /^Удалить пополнение/ }),
    ).toHaveCount(0);
    expect(state.writes).toEqual([]);
  });

  test('invalid amounts and comments do not submit and forbidden responses do not change the balance', async ({
    page,
  }) => {
    const state = await mockApi(page);
    const panel = await open(page);
    await panel.getByLabel('Сумма пополнения, RUB').fill('0');
    await panel.getByLabel('Комментарий к пополнению').fill('Перевод');
    await panel.getByRole('button', { name: 'Добавить пополнение' }).click();
    await expect(panel.getByRole('alert')).toContainText('от 0,01');
    expect(state.writes).toEqual([]);
    await panel.getByLabel('Сумма пополнения, RUB').fill('0,01');
    await panel.getByLabel('Комментарий к пополнению').fill('   ');
    await panel.getByRole('button', { name: 'Добавить пополнение' }).click();
    await expect(panel.getByRole('alert')).toContainText('Укажите комментарий');
    expect(state.writes).toEqual([]);
    state.createError = 403;
    await panel
      .getByLabel('Комментарий к пополнению')
      .fill('Неподтверждённый перевод');
    await panel.getByRole('button', { name: 'Добавить пополнение' }).click();
    await expect(panel.getByRole('alert')).toContainText('нет доступа');
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s020\s000\s?₽/,
    );
    await expect(panel.getByLabel('Сумма пополнения, RUB')).toHaveValue('0,01');
    expect(state.writes).toHaveLength(1);
  });

  test('refresh handles API errors, polls actual balances and preserves a draft on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install();
    const state = await mockApi(page);
    state.listError = 404;
    const panel = await open(page);
    await expect(panel.getByRole('alert')).toBeVisible();
    await expect(
      panel.getByRole('button', { name: 'Добавить пополнение' }),
    ).toHaveCount(0);
    state.listError = 0;
    await panel.getByRole('button', { name: 'Повторить' }).click();
    await expect(panel.getByRole('listitem')).toHaveCount(1);
    await panel.getByLabel('Сумма пополнения, RUB').fill('1500,5');
    await panel.getByLabel('Комментарий к пополнению').fill('Ещё не сохранено');
    state.currentMinor += 10000;
    await page.clock.fastForward(31000);
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s020\s100\s?₽/,
    );
    await expect(panel.getByLabel('Сумма пополнения, RUB')).toHaveValue(
      '1.500,50',
    );
    await expect(panel.getByLabel('Комментарий к пополнению')).toHaveValue(
      'Ещё не сохранено',
    );
    expect(state.writes).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .include('.project-adjustments')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
  });

  test('an interrupted response reloads the committed entry without automatically adding it again', async ({
    page,
  }) => {
    await page.clock.install();
    const state = await mockApi(page);
    const panel = await open(page);
    state.dropResponse = true;
    await panel.getByLabel('Сумма пополнения, RUB').fill('1500');
    await panel
      .getByLabel('Комментарий к пополнению')
      .fill('Перевод с потерянным ответом');
    await panel.getByRole('button', { name: 'Добавить пополнение' }).click();
    await expect(panel.getByRole('alert')).toContainText(
      'Проверьте обновлённую историю',
    );
    await expect(
      panel
        .getByRole('listitem')
        .filter({ hasText: 'Перевод с потерянным ответом' }),
    ).toHaveCount(1);
    await expect(panel.locator('.project-adjustments-balance')).toContainText(
      /2\s021\s500\s?₽/,
    );
    await page.clock.fastForward(31000);
    expect(state.writes).toHaveLength(1);
  });
});
