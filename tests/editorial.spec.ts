import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const practicalRoutes = [
  '/how-to-support/',
  '/results/',
  '/about/constituent-the-documents/',
  '/about/reporting/',
  '/about/governing-bodies/',
  '/about/company-information/',
];

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`practical pages fit at ${width}px with regular and enlarged text`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of practicalRoutes) {
      await page.goto(path);
      for (const enlarged of [false, true]) {
        if (enlarged)
          await page.getByRole('button', { name: 'Увеличить текст' }).click();
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          `${path}, enlarged: ${enlarged}`,
        ).toBe(true);
        const clipped = await page
          .locator(
            'main h1, main h2, main h3, main p, .calculator-results strong, .cycle-steps li, .requisites-list dd',
          )
          .evaluateAll((nodes) =>
            nodes
              .filter(
                (node) =>
                  node.getClientRects().length &&
                  node.scrollWidth > node.clientWidth + 2,
              )
              .map((node) => node.textContent),
          );
        expect(clipped, `${path}, enlarged: ${enlarged}`).toEqual([]);
        if (enlarged)
          await page.getByRole('button', { name: 'Увеличить текст' }).click();
      }
    }
  });
}

for (const path of practicalRoutes) {
  test(`practical page accessibility ${path}`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test('support path keeps the chosen audience and capital in the email', async ({
  page,
}) => {
  await page.goto('/how-to-support/');
  const company = page.getByRole('button', { name: 'Компания', exact: true });
  await company.focus();
  await page.keyboard.press('Enter');
  await expect(company).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('region', { name: 'Компания', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Выпускник', exact: true }),
  ).toBeHidden();
  await page
    .getByLabel('Что вы хотите поддержать?')
    .selectOption('Наука и инженерия для Арктики');
  const href = await page
    .getByRole('link', { name: 'Обсудить участие', exact: true })
    .getAttribute('href');
  const message = new URL(href!);
  expect(message.protocol).toBe('mailto:');
  expect(message.searchParams.get('subject')).toContain(
    'Корпоративное партнёрство',
  );
  expect(message.searchParams.get('body')).toContain(
    'Наука и инженерия для Арктики',
  );
  await expect(page.locator('.support-methods article')).toHaveCount(4);
  await expect(page.locator('.publication-status')).toHaveCount(0);
  await expect(page.locator('form[action], iframe')).toHaveCount(0);
});

test('donation window leads to a useful support route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Стать благотворителем' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Заявка по почте не списывает средства');
  await dialog.getByRole('link', { name: 'Как поддержать' }).click();
  await expect(page).toHaveURL(/\/how-to-support\/$/);
  await expect(
    page.getByRole('heading', { name: 'Поддержать университет' }),
  ).toBeVisible();
});

test('calculator handles positive, zero, and negative scenarios without promising returns', async ({
  page,
}) => {
  await page.goto('/how-to-support/');
  const calculator = page.getByRole('region', {
    name: 'Долгий горизонт поддержки',
  });
  await expect(calculator.getByTestId('annual-income')).toHaveText(
    '5 000 рублей',
  );
  await expect(calculator.getByTestId('total-income')).toHaveText(
    '50 000 рублей',
  );
  const rate = calculator.getByRole('slider', { name: /Ставка для расчёта/ });
  await rate.fill('0');
  await expect(calculator.getByTestId('annual-income')).toHaveText('0 рублей');
  await rate.fill('-5');
  await expect(calculator.getByTestId('annual-income')).toHaveText(
    '-5 000 рублей',
  );
  await expect(calculator.getByText('Расчётное снижение за год')).toBeVisible();
  const amount = calculator.getByRole('slider', { name: /Сумма капитала/ });
  await amount.fill('200000');
  await calculator.getByRole('slider', { name: /Горизонт расчёта/ }).fill('2');
  await expect(calculator.getByTestId('total-income')).toHaveText(
    '-20 000 рублей',
  );
  await expect(calculator).toContainText('Доходность не гарантирована');
});

test('document filters offer requests for the selected topic without fake downloads', async ({
  page,
}) => {
  await page.goto('/about/constituent-the-documents/');
  await expect(page.locator('.document-item:visible')).toHaveCount(9);
  await page.getByRole('button', { name: 'Отчётность', exact: true }).click();
  await expect(page.locator('.document-item:visible')).toHaveCount(3);
  await expect(page.locator('.document-item:visible')).toContainText([
    'Годовой отчёт',
    'Бухгалтерская отчётность',
    'Аудиторское заключение',
  ]);
  const requests = page.locator('.document-item:visible a');
  await expect(requests).toHaveCount(3);
  for (const [index, topic] of [
    'Годовой отчёт',
    'Бухгалтерская отчётность',
    'Аудиторское заключение',
  ].entries()) {
    const href = new URL((await requests.nth(index).getAttribute('href'))!);
    expect(href.protocol).toBe('mailto:');
    expect(href.searchParams.get('subject')).toContain(topic);
    expect(href.searchParams.get('body')).toContain(topic);
  }
  await expect(page.locator('.publication-status')).toHaveCount(0);
  await expect(page.locator('a[download], a[href="#"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Все материалы' }).click();
  await expect(page.locator('.document-item:visible')).toHaveCount(9);
});

test('FAQ combines category and normalized Russian search', async ({
  page,
}) => {
  await page.goto('/answers-on-questions/');
  await expect(page.locator('.faq details:visible')).toHaveCount(53);
  await page.getByLabel('Тема вопроса').selectOption('Деньги и управление');
  await expect(page.locator('.faq details:visible')).toHaveCount(11);
  const query = page.getByRole('searchbox', { name: 'Найти ответ' });
  await query.fill('  ДОХОДНОСТЬ  ');
  await expect(page.locator('.faq details:visible')).toHaveCount(1);
  await page.locator('.faq summary:visible').click();
  await expect(page.locator('.faq details:visible')).toContainText(
    'не предполагает инвестиционного дохода',
  );
  await page.getByLabel('Тема вопроса').selectOption('Все вопросы');
  await query.fill('пожертвование в память');
  await expect(page.locator('.faq details:visible')).toHaveCount(1);
  await query.fill('бухгалтерская отчетность');
  await expect(page.locator('.faq details:visible')).toHaveCount(1);
});

test('income cycle switches the visible explanation by keyboard', async ({
  page,
}) => {
  await page.goto('/about/reporting/');
  const cycle = page.getByRole('region', {
    name: 'Как доход становится поддержкой',
  });
  await expect(cycle.locator('.cycle-description:visible')).toHaveCount(1);
  const last = cycle.getByRole('button', { name: '06 Публичный отчёт' });
  await last.focus();
  await page.keyboard.press('Enter');
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  await expect(cycle.locator('.cycle-description:visible')).toHaveCount(1);
  await expect(cycle.locator('.cycle-description:visible')).toContainText(
    'Открытый отчёт о результатах',
  );
});

test('new practical pages remain readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/how-to-support/');
  await expect(page.locator('.support-path:visible')).toHaveCount(4);
  await page.goto('http://127.0.0.1:4173/projects/');
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
  await expect(
    page.getByRole('heading', {
      name: 'Стипендии для студентов Арктики',
      exact: true,
    }),
  ).toHaveCount(1);
  await page.goto('http://127.0.0.1:4173/about/reporting/');
  await expect(page.locator('.cycle-description:visible')).toHaveCount(6);
  await page.goto('http://127.0.0.1:4173/about/constituent-the-documents/');
  await expect(page.locator('.document-item:visible')).toHaveCount(9);
  await page.goto('http://127.0.0.1:4173/answers-on-questions/');
  const question = page
    .locator('summary')
    .filter({ hasText: 'Почему даже немного денег' });
  await question.click();
  await expect(question.locator('..')).toHaveAttribute('open', '');
  await context.close();
});

test('editorial headings and identity are consistent', async ({ page }) => {
  for (const path of [
    '/',
    '/about/general-information/',
    '/philanthropists/history/',
    '/projects/students/',
    '/contacts-and-requisites/',
  ]) {
    await page.goto(path);
    const badHeadings = await page
      .locator('main h1, main h2, main h3')
      .allTextContents();
    expect(badHeadings.filter((text) => /\.[\s\u00a0]*$/.test(text))).toEqual(
      [],
    );
    await expect(
      page.locator('header .fund-mark, footer .fund-mark, .hero-identity'),
    ).toHaveCount(0);
  }
  await page.goto('/');
  await expect(page.locator('.activity-target')).toHaveCount(0);
  await expect(page.locator('.metric-value')).toHaveText(['4', '3', '1', '∞']);
});
