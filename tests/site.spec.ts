import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import originalPages from './fixtures/original-pages.json' with { type: 'json' };
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
for (const original of originalPages) {
  test(`renders expected page: ${original.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await page.goto(original.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(original.title);
    expect(normalize((await page.locator('main').textContent()) ?? '')).toBe(
      original.text,
    );
    await page.reload();
    await expect(page.locator('main h1')).toHaveText(original.title);
    expect(errors).toEqual([]);
  });
}
test('every route is prerendered with readable content and local assets', async ({
  browser,
}) => {
  // This scenario navigates all registered routes sequentially, including font loading.
  test.setTimeout(60_000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const original of originalPages) {
    const relative =
      original.path === '/'
        ? 'index.html'
        : `${original.path.slice(1)}index.html`;
    const html = await readFile(resolve('dist', relative), 'utf8');
    expect(html).toContain('<main');
    expect(html).toContain('id="root"');
    const response = await page.goto(`http://127.0.0.1:4173${original.path}`);
    expect(response?.status()).toBe(200);
    expect(normalize((await page.locator('main').textContent()) ?? '')).toBe(
      original.text,
    );
  }
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('header .fund-mark')).toHaveCount(0);
  await expect(page.locator('header .brand-fund')).toContainText(
    'Заполярного университета',
  );
  await context.close();
});
test('donation dialog traps focus and restores it on Escape, close, and backdrop', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.locator('.hero-actions button');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('платёж не производится');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Понятно' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
test('mobile menu supports keyboard and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Меню', exact: true });
  const navigation = page.getByRole('navigation', {
    name: 'Основная навигация',
  });
  await expect(navigation).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(navigation).toBeHidden();
  await toggle.click();
  await navigation
    .getByRole('link', { name: 'Новости и истории', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText('Новости и истории');
  await toggle.click();
  await expect(
    navigation.getByRole('link', { name: 'Новости и истории', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
});
test('FAQ opens by keyboard and accessibility preference survives navigation', async ({
  page,
}) => {
  await page.goto('/answers-on-questions/');
  const question = page.locator('summary').first();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Увеличить текст' }).click();
  await expect(page.locator('body')).toHaveClass(/accessible/);
  await page.goto('/projects/students/');
  await expect(
    page.getByRole('button', { name: 'Увеличить текст' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveClass(/accessible/);
});
for (const width of [360, 390, 768, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/contacts-and-requisites/',
      '/projects/',
      '/answers-on-questions/',
      '/projects/students/',
      '/projects/science/',
      '/about/general-information/',
      '/events/',
      '/about/reporting/',
      '/how-to-support/',
      '/about/governing-bodies/',
      '/about/company-information/',
      '/about/constituent-the-documents/',
      '/results/',
    ]) {
      await page.goto(path);
      await expect(page.locator('header .brand-fund')).toBeVisible();
      const brand = await page.locator('header .brand').boundingBox();
      const actions = await page.locator('.header-actions').boundingBox();
      expect(brand).not.toBeNull();
      expect(actions).not.toBeNull();
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(actions!.x);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator('.metric-card')
          .evaluateAll((cards) =>
            cards
              .filter((card) => card.scrollWidth > card.clientWidth + 1)
              .map((card) => card.textContent),
          ),
      ).toEqual([]);
      await page.getByRole('button', { name: 'Увеличить текст' }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator('.metric-card')
          .evaluateAll((cards) =>
            cards
              .filter((card) => card.scrollWidth > card.clientWidth + 1)
              .map((card) => card.textContent),
          ),
      ).toEqual([]);
      await page.getByRole('button', { name: 'Увеличить текст' }).click();
    }
  });
}
test('internal links resolve and images load', async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const path of [
    '/',
    '/about/general-information/',
    '/projects/',
    '/contacts-and-requisites/',
  ]) {
    await page.goto(path);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
      hrefs.add(href);
    for (const src of await page
      .locator('img')
      .evaluateAll((images) =>
        images.map((image) => (image as HTMLImageElement).src),
      ))
      expect((await request.get(src)).ok()).toBe(true);
  }
  for (const href of hrefs)
    expect((await request.get(href)).ok(), href).toBe(true);
});
test('unknown route and index.html aliases', async ({ page }) => {
  await page.goto('/unknown-page/');
  await expect(page.locator('h1')).toHaveText('Страница не найдена');
  await page.goto('/about/general-information/index.html');
  await expect(page.locator('h1')).toHaveText('Фонд возможностей для Севера');
});
for (const path of [
  '/',
  '/answers-on-questions/',
  '/contacts-and-requisites/',
  '/projects/students/',
  '/projects/science/',
  '/projects/campus/',
  '/projects/alumni/',
  '/projects/',
  '/about/general-information/',
  '/philanthropists/history/',
  '/news/',
  '/events/',
  '/about/reporting/',
  '/how-to-support/',
  '/about/governing-bodies/',
  '/about/company-information/',
  '/about/constituent-the-documents/',
  '/results/',
]) {
  test(`accessibility audit ${path}`, async ({ page }) => {
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
test('donation dialog accessibility audit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero-actions button').click();
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
test('animations initialise and clean up when accessible mode changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect
    .poll(() => page.locator('.reading-progress').getAttribute('style'))
    .toContain('transform');
  await expect(page.locator('.hero-copy')).toBeVisible();
  await page.locator('.hero-actions button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Увеличить текст' }).click();
  await expect(page.locator('body')).toHaveClass(/accessible/);
  await expect(page.locator('.headline-line').first()).toHaveCSS(
    'opacity',
    '1',
  );
  expect(errors).toEqual([]);
});

test('mobile navigation stays available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Новости и истории', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText('Новости и истории');
  await context.close();
});

test('community roles switch stories and destination links with the keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const community = page.locator('.community');
  const graduate = community.getByRole('button', {
    name: 'Я выпускник',
    exact: true,
  });
  const partner = community.getByRole('button', {
    name: 'Я партнёр',
    exact: true,
  });
  const friend = community.getByRole('button', {
    name: 'Мне близок Север',
    exact: true,
  });
  await expect(graduate).toHaveAttribute('aria-pressed', 'true');
  await expect(
    community.getByRole('link', { name: 'Поддержка талантов' }),
  ).toHaveAttribute('href', '/projects/students/');
  await partner.focus();
  await page.keyboard.press('Enter');
  await expect(partner).toHaveAttribute('aria-pressed', 'true');
  await expect(graduate).toHaveAttribute('aria-pressed', 'false');
  await expect(
    community.getByRole('region', { name: 'Я партнёр' }),
  ).toBeVisible();
  await expect(
    community.getByRole('region', { name: 'Я выпускник' }),
  ).toBeHidden();
  await expect(
    community.getByRole('link', { name: 'Наука для Арктики' }),
  ).toHaveAttribute('href', '/projects/science/');
  await friend.focus();
  await page.keyboard.press('Space');
  await expect(friend).toHaveAttribute('aria-pressed', 'true');
  await expect(
    community.getByRole('link', { name: 'Найти своё направление' }),
  ).toHaveAttribute('href', '/project/all-project/');
  await expect(community.locator('.globe-satellite-motion')).toBeHidden();
  await expect(community.locator('.globe-satellite-still')).toBeVisible();
});

test('all community stories stay readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('region', { name: 'Я выпускник' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Я партнёр' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Мне близок Север' }),
  ).toBeVisible();
  await expect(page.locator('.community-choices')).toBeHidden();
  await context.close();
});

test('direction constellation changes the active story and opens its matching page', async ({
  page,
}) => {
  await page.goto('/projects/');
  const explorer = page.getByRole('region', {
    name: 'Выбор направления поддержки',
  });
  const science = explorer.getByRole('button', { name: 'Наука', exact: true });
  await science.focus();
  await page.keyboard.press('Enter');
  await expect(science).toHaveAttribute('aria-pressed', 'true');
  await expect(
    explorer.getByRole('heading', { name: 'Наука и инженерия для Арктики' }),
  ).toBeVisible();
  await expect(
    explorer.getByRole('link', { name: 'Познакомиться с направлением' }),
  ).toHaveAttribute('href', '/projects/science/');
  const campus = explorer.getByRole('button', { name: 'Кампус', exact: true });
  await campus.focus();
  await page.keyboard.press('Space');
  await expect(science).toHaveAttribute('aria-pressed', 'false');
  await expect(campus).toHaveAttribute('aria-pressed', 'true');
  await explorer
    .getByRole('link', { name: 'Познакомиться с направлением' })
    .click();
  await expect(page.locator('main h1')).toHaveText(
    'Кампус и студенческая среда',
  );
});

test('FAQ search filters answers, handles no results, and resets', async ({
  page,
}) => {
  await page.goto('/answers-on-questions/');
  const search = page.getByRole('searchbox', { name: 'Найти ответ' });
  await search.fill('  УСТАВ, ОТЧЁТНОСТЬ И ДОКУМЕНТЫ  ');
  await expect(page.locator('.faq details:visible')).toHaveCount(1);
  await expect(page.getByRole('status')).toHaveText('Найдено: 1 из 53');
  await page.locator('.faq summary:visible').click();
  await expect(page.locator('.faq details:visible')).toHaveAttribute(
    'open',
    '',
  );
  await search.fill('несуществующийвопрос');
  await expect(page.locator('.faq details:visible')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Пока нет такого ответа' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Очистить поиск' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.faq details:visible')).toHaveCount(53);
});

test('endowment journey switches explanations by keyboard on home and about pages', async ({
  page,
}) => {
  for (const route of ['/', '/about/general-information/']) {
    await page.goto(route);
    const mechanism = page.getByRole('region', {
      name: 'Как работает эндаумент',
    });
    const capital = mechanism.getByRole('button', {
      name: 'Подробнее об этапе: Капитал',
    });
    await capital.focus();
    await page.keyboard.press('Enter');
    await expect(capital).toHaveAttribute('aria-pressed', 'true');
    await expect(
      mechanism.getByRole('region', {
        name: 'Подробнее: Капитал',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      mechanism.getByRole('region', { name: 'Подробнее: Вклад', exact: true }),
    ).toBeHidden();
    const development = mechanism.getByRole('button', {
      name: 'Подробнее об этапе: Развитие',
    });
    await development.focus();
    await page.keyboard.press('Space');
    await expect(development).toHaveAttribute('aria-pressed', 'true');
    await expect(capital).toHaveAttribute('aria-pressed', 'false');
    await expect(
      mechanism.getByRole('heading', {
        name: 'За каждым направлением стоят люди',
      }),
    ).toBeVisible();
  }
});

test('activity cards switch explanations by keyboard and label illustrative figures clearly', async ({
  page,
}) => {
  await page.goto('/');
  const activity = page.getByRole('region', {
    name: 'Показатели деятельности',
    exact: true,
  });
  const donors = activity.getByRole('button', { name: /Благотворители/ });
  await expect(
    activity.getByText('Демонстрационные данные', { exact: true }),
  ).toBeVisible();
  await expect(activity.locator('.activity-target')).toContainText(
    'Достигнуто 64%',
  );
  await donors.focus();
  await page.keyboard.press('Enter');
  await expect(donors).toHaveAttribute('aria-pressed', 'true');
  const explanation = activity.getByRole('region', {
    name: 'О показателе',
    exact: true,
  });
  await expect(
    explanation.getByRole('heading', { name: 'Благотворители', exact: true }),
  ).toBeVisible();
  await expect(explanation).toContainText('Количество приведено для примера');
  await expect(activity.locator('.metric-value')).toHaveText([
    /3\s*200\s*000\s*рублей/,
    '128',
    '7',
    /240\s*000\s*рублей/,
  ]);
  await expect(activity.getByRole('button', { pressed: true })).toHaveCount(1);
  await activity.getByRole('link', { name: 'Отчётность фонда' }).click();
  await expect(page).toHaveURL(/\/about\/reporting\//);
});

test('satellite follows its ellipse and compass rings rotate continuously with motion preferences respected', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.orbit-outer')).toHaveCSS(
    'animation-iteration-count',
    'infinite',
  );
  await expect(page.locator('.orbit-outer')).toHaveCSS(
    'animation-play-state',
    'running',
  );
  const samples = await page.locator('.globe-grid').evaluate((element) => {
    const svg = element as SVGSVGElement;
    const satellite = svg.querySelector<SVGGElement>(
      '.globe-satellite-motion',
    )!;
    const plane = svg.querySelector<SVGGElement>('.globe-orbit-plane')!;
    svg.pauseAnimations();
    return [0, 5, 11, 18, 27].map((time) => {
      svg.setCurrentTime(time);
      const point = new DOMPoint(0, 0)
        .matrixTransform(satellite.getCTM()!)
        .matrixTransform(plane.getCTM()!.inverse());
      return {
        x: point.x,
        y: point.y,
        ellipse: ((point.x - 260) / 246) ** 2 + ((point.y - 260) / 119) ** 2,
      };
    });
  });
  for (const sample of samples) expect(sample.ellipse).toBeCloseTo(1, 3);
  expect(Math.abs(samples[0]!.x - samples[2]!.x)).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Увеличить текст' }).click();
  await expect(page.locator('.orbit-outer')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.globe-satellite-motion')).toBeHidden();
  await expect(page.locator('.globe-satellite-still')).toBeVisible();
  await page.getByRole('button', { name: 'Увеличить текст' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.orbit-outer')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.globe-satellite-motion')).toBeHidden();
});

test('small donations question is searchable and opens with the keyboard', async ({
  page,
}) => {
  await page.goto('/answers-on-questions/');
  await page
    .getByRole('searchbox', { name: 'Найти ответ' })
    .fill('немного денег');
  const question = page
    .locator('.faq summary')
    .filter({ hasText: 'Почему даже немного денег — это важно?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq details:visible')).toHaveAttribute(
    'open',
    '',
  );
  await expect(page.locator('.faq details:visible')).toContainText(
    'Вы выбираете посильную сумму',
  );
});

test('polar postcard switches artwork, description, and pressed state with the keyboard', async ({
  page,
}) => {
  await page.goto('/contacts-and-requisites/');
  const postcard = page.locator('.polar-postcard');
  const day = postcard.getByRole('button', {
    name: 'Полярный день',
    exact: true,
  });
  const night = postcard.getByRole('button', {
    name: 'Полярная ночь',
    exact: true,
  });
  const dayColor = await postcard
    .locator('.polar-sky')
    .evaluate((node) => getComputedStyle(node).fill);
  await night.focus();
  await page.keyboard.press('Enter');
  await expect(night).toHaveAttribute('aria-pressed', 'true');
  await expect(day).toHaveAttribute('aria-pressed', 'false');
  await expect(postcard.getByRole('img')).toHaveAttribute(
    'aria-label',
    /полярная ночь/,
  );
  await expect(postcard.getByRole('status')).toHaveText(
    'Время северного сияния',
  );
  expect(
    await postcard
      .locator('.polar-sky')
      .evaluate((node) => getComputedStyle(node).fill),
  ).not.toBe(dayColor);
  await expect(postcard.locator('.polar-aurora')).toHaveCSS(
    'animation-name',
    'none',
  );
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations.map((item) => item.id)).toEqual([]);
  await day.focus();
  await page.keyboard.press('Space');
  await expect(day).toHaveAttribute('aria-pressed', 'true');
  await expect(postcard.locator('.polar-sky')).toHaveCSS('fill', dayColor);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await night.click();
  await expect(postcard.locator('.polar-aurora')).toHaveCSS(
    'animation-name',
    'polar-lights',
  );
  await page.getByRole('button', { name: 'Увеличить текст' }).click();
  await expect(postcard.locator('.polar-aurora')).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('journey explanations and default polar illustration remain readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/about/general-information/');
  for (const label of ['Вклад', 'Капитал', 'Развитие'])
    await expect(
      page.getByRole('region', { name: `Подробнее: ${label}`, exact: true }),
    ).toBeVisible();
  await expect(page.locator('.step-action').first()).toBeHidden();
  await page.goto('http://127.0.0.1:4173/contacts-and-requisites/');
  await expect(page.getByRole('img', { name: /полярный день/ })).toBeVisible();
  await expect(page.locator('.polar-controls')).toBeHidden();
  await context.close();
});

test('project icons do not overlap card headings or descriptions at phone, tablet, and desktop widths', async ({
  page,
}) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/projects/');
    const overlaps = await page.locator('.project-card').evaluateAll((cards) =>
      cards.flatMap((card) => {
        const icon = card
          .querySelector('.project-symbol')!
          .getBoundingClientRect();
        return Array.from(card.querySelectorAll('h3,p'))
          .filter((node) => {
            const text = node.getBoundingClientRect();
            return (
              Math.min(icon.right, text.right) -
                Math.max(icon.left, text.left) >
                1 &&
              Math.min(icon.bottom, text.bottom) -
                Math.max(icon.top, text.top) >
                1
            );
          })
          .map((node) => node.textContent);
      }),
    );
    expect(overlaps, `Overlapping project icon at ${width}px`).toEqual([]);
  }
});
