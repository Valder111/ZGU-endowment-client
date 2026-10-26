import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import originalPages from './fixtures/original-pages.json' with { type: 'json' };
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
for (const original of originalPages) {
  test(`preserves original page: ${original.path}`, async ({ page }) => {
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
  await expect(page.locator('.brand img')).toBeVisible();
  expect(
    await page
      .locator('.brand img')
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
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
  await navigation.getByRole('link', { name: 'Новости', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Жизнь университета');
  await toggle.click();
  await expect(
    navigation.getByRole('link', { name: 'Новости', exact: true }),
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
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.getByRole('button', { name: 'Увеличить текст' }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
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
  '/projects/',
  '/about/general-information/',
  '/philanthropists/history/',
  '/news/',
  '/events/',
  '/about/reporting/',
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
    .getByRole('link', { name: 'Новости', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText('Жизнь университета');
  await context.close();
});
