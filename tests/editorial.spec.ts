import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const practicalRoutes = [
  '/anniversary/',
  '/how-to-support/',
  '/results/',
  '/about/constituent-the-documents/',
  '/about/reporting/',
  '/about/governing-bodies/',
  '/about/company-information/',
];

test('anniversary invitation preserves the chosen contribution in an enquiry', async ({
  page,
}) => {
  await page.goto('/anniversary/');
  await expect(
    page.getByRole('group', { name: 'Сбор целевого капитала' }),
  ).toContainText('2 050 000 рублей');
  await page
    .getByRole('button', { name: 'Сделать подарок университету' })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Регулярно', exact: true }).click();
  await dialog.getByRole('button', { name: '3 000 ₽', exact: true }).click();
  const direction = dialog.getByRole('combobox', {
    name: 'Направление поддержки',
  });
  const options = page.getByRole('listbox', { name: 'Направления поддержки' });
  await direction.press('Enter');
  await expect(options).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(options).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(direction).toBeFocused();
  await direction.press('Enter');
  await expect(
    options.getByRole('option', { name: 'Общее развитие университета' }),
  ).toBeFocused();
  const chosenCapital = 'Инфраструктура для развития';
  for (const name of [
    'Стипендии для талантов',
    'Наука и инженерия для Арктики',
    chosenCapital,
  ]) {
    await page.keyboard.press('ArrowDown');
    // Radix moves focus asynchronously after the key event.
    await expect(
      options.getByRole('option', { name, exact: true }),
    ).toBeFocused();
  }
  await page.keyboard.press('Enter');
  await expect(direction).toHaveText(chosenCapital);
  const href = new URL(
    (await dialog
      .getByRole('link', { name: 'Обсудить вклад' })
      .getAttribute('href'))!,
  );
  expect(href.protocol).toBe('mailto:');
  expect(href.searchParams.get('body')).toContain('3000 рублей');
  expect(href.searchParams.get('body')).toContain('Регулярно');
  expect(href.searchParams.get('body')).toContain(chosenCapital);
  await expect(dialog).toContainText('не списывает средства');
});

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
    .getByRole('combobox', { name: 'Что вы хотите поддержать?' })
    .click();
  await page
    .getByRole('option', { name: 'Наука и инженерия для Арктики' })
    .click();
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

test('jubilee photos open only on button activation and support keyboard dismissal', async ({
  page,
}) => {
  await page.goto('/#university-anniversary');
  const gallery = page.getByRole('group', {
    name: 'Созвездие ЗГУ – юбилейная фотогалерея',
  });
  await gallery.scrollIntoViewIfNeeded();

  const point = await gallery
    .locator('.orbit-line')
    .first()
    .evaluate((node) => {
      const orbit = node as SVGEllipseElement;
      const { x, y } = orbit
        .getPointAtLength(0)
        .matrixTransform(orbit.getScreenCTM()!);
      return { x, y };
    });
  await page.mouse.move(point.x, point.y);
  await page.mouse.click(point.x, point.y);
  await expect(gallery.getByRole('img')).toHaveCount(0);
  await gallery.getByRole('button', { name: 'Люди', exact: true }).hover();
  await expect(gallery.getByRole('img')).toHaveCount(0);

  for (const [name, alt] of [
    ['Люди', 'Участники полевой школы с инструментами на практике'],
    [
      'Наука',
      'Исследовательница работает с оборудованием в лаборатории геомеханики',
    ],
    ['Инженерия', 'Студент работает с механической деталью в мастерской'],
  ]) {
    await gallery.getByRole('button', { name, exact: true }).click();
    const image = gallery.getByRole('img', { name: alt, exact: true });
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((photo: HTMLImageElement) => photo.naturalWidth),
    ).toBeGreaterThan(0);
  }

  const science = gallery.getByRole('button', { name: 'Наука', exact: true });
  await science.focus();
  await expect(gallery.getByRole('img')).toHaveAttribute('alt', /мастерской/);
  await page.keyboard.press('Enter');
  await expect(gallery.getByRole('img')).toHaveAttribute('alt', /геомеханики/);
  await expect(science).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(gallery.getByRole('img')).toHaveCount(0);
  await expect(science).toBeFocused();
});

test('jubilee photo gallery can be used by touch with orbits paused', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    hasTouch: true,
    reducedMotion: 'no-preference',
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/anniversary/');
    const gallery = page.getByRole('group', {
      name: 'Созвездие ЗГУ – юбилейная фотогалерея',
    });
    await gallery
      .getByRole('button', { name: 'Остановить движение орбит' })
      .tap();
    await expect(gallery.locator('.orbit-satellite').first()).toHaveCSS(
      'animation-play-state',
      'paused',
    );
    const travel = await gallery
      .locator('.orbit-satellite')
      .evaluateAll((satellites) =>
        satellites.map((satellite) => {
          const [flight] = satellite.getAnimations();
          if (!flight) throw new Error('The satellite has no flight animation');
          flight.currentTime = 1000;
          const from = Number.parseFloat(
            getComputedStyle(satellite).strokeDashoffset,
          );
          flight.currentTime = 1700;
          const to = Number.parseFloat(
            getComputedStyle(satellite).strokeDashoffset,
          );
          return to - from;
        }),
      );
    expect(travel.every((distance) => distance > 0)).toBe(true);
    await gallery.getByRole('button', { name: 'Инженерия', exact: true }).tap();
    await expect(
      gallery.getByRole('img', { name: /механической деталью/ }),
    ).toBeVisible();
    await expect(
      gallery.getByRole('button', { name: 'Инженерия', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  } finally {
    await context.close();
  }
});

test('donation window leads to a useful support route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Стать благотворителем' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Заявка по почте не списывает средства');
  const custom = dialog.getByRole('button', {
    name: 'Другая сумма',
    exact: true,
  });
  const customField = dialog.getByLabel('Другая сумма, рублей');
  await expect(customField).toBeHidden();
  await custom.click();
  await expect(customField).toBeVisible();
  await customField.fill('740');
  await customField.press('0');
  await customField.press('0');
  await expect(customField).toHaveValue('74.000');
  await expect(
    dialog.getByRole('link', { name: 'Обсудить вклад' }),
  ).toHaveAttribute('href', /74000%20/);
  await customField.fill('');
  await customField.pressSequentially('1.5');
  await expect(customField).toHaveValue('1.5');
  await expect(dialog.getByText('Обсудить вклад')).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await customField.pressSequentially('00');
  await expect(customField).toHaveValue('1.500');
  await expect(
    dialog.getByRole('link', { name: 'Обсудить вклад' }),
  ).toHaveAttribute('href', /1500%20/);
  await customField.fill('0');
  await expect(dialog.getByText('Обсудить вклад')).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await dialog.getByRole('button', { name: '500 ₽', exact: true }).click();
  await expect(customField).toBeHidden();
  await dialog.getByRole('link', { name: 'Как поддержать' }).click();
  await expect(page).toHaveURL(/\/how-to-support\/$/);
  await expect(
    page.getByRole('heading', { name: 'Поддержать университет' }),
  ).toBeVisible();
});

test('calculator handles positive and zero scenarios without promising returns', async ({
  page,
}) => {
  await page.goto('/how-to-support/');
  const calculator = page.getByRole('region', {
    name: 'Долгий горизонт поддержки',
  });
  await expect(calculator.getByTestId('annual-income')).toHaveText(
    '10 000 рублей',
  );
  await expect(calculator.getByTestId('total-income')).toHaveText(
    '100 000 рублей',
  );
  const rate = calculator.getByRole('slider', { name: /Ставка для расчёта/ });
  await rate.fill('0');
  await expect(calculator.getByTestId('annual-income')).toHaveText('0 рублей');
  await expect(rate).toHaveAttribute('min', '0');
  await rate.fill('5');
  const amount = calculator.getByRole('slider', { name: /Сумма капитала/ });
  await amount.fill('200000');
  await calculator.getByRole('slider', { name: /Горизонт расчёта/ }).fill('2');
  await expect(calculator.getByTestId('total-income')).toHaveText(
    '20 000 рублей',
  );
  await expect(calculator).toContainText(
    'Расчёт не является прогнозом доходности',
  );
});

test('document filters separate available files from requests for reports', async ({
  page,
}) => {
  await page.goto('/about/constituent-the-documents/');
  await expect(page.locator('.document-item:visible')).toHaveCount(11);
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
  await expect(
    page.locator('.document-item:visible a[download], a[href="#"]'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Все материалы' }).click();
  await expect(page.locator('.document-item:visible')).toHaveCount(11);
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

test('income cycle responds to clicks on the card body and to keyboard selection', async ({
  page,
}) => {
  await page.goto('/about/reporting/');
  const cycle = page.getByRole('region', {
    name: 'Как доход становится поддержкой',
  });
  await expect(cycle.locator('.cycle-description:visible')).toHaveCount(1);
  const second = cycle.getByRole('button', {
    name: '02 План использования дохода',
  });
  await second.locator('..').click({ position: { x: 20, y: 160 } });
  await expect(second).toHaveAttribute('aria-pressed', 'true');
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
      name: 'Стипендии для талантов',
      exact: true,
    }),
  ).toHaveCount(1);
  await page.goto('http://127.0.0.1:4173/about/reporting/');
  await expect(page.locator('.cycle-description:visible')).toHaveCount(6);
  await page.goto('http://127.0.0.1:4173/about/constituent-the-documents/');
  await expect(page.locator('.document-item:visible')).toHaveCount(11);
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
