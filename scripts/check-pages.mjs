/* global document */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const output = path.resolve('dist');
const routes = JSON.parse(
  await readFile('tests/fixtures/original-pages.json', 'utf8'),
);
const index = await readFile(path.join(output, 'index.html'), 'utf8');
const base = index.match(/<script\b[^>]*src="([^"?]+)assets\/[^"?]+\.js"/)?.[1];
assert(
  base?.startsWith('/') && base.endsWith('/'),
  'Build the website before checking Pages',
);
await readFile(path.join(output, '.nojekyll'));
const notFound = await readFile(path.join(output, '404.html'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

// Serve real HTML files and a real 404, without a development-server SPA fallback.
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (!pathname.startsWith(base)) throw new Error('Outside the website base');
    let file = path.resolve(output, pathname.slice(base.length));
    if (file !== output && !file.startsWith(output + path.sep))
      throw new Error('Outside dist');
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        response
          .writeHead(301, { Location: `${url.pathname}/${url.search}` })
          .end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file);
    response
      .writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      })
      .end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': types['.html'] }).end(notFound);
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;
const siteUrl = (route) => `${origin}${base}${route.replace(/^\//, '')}`;
let browser;
try {
  const references = new Set();
  for (const route of routes) {
    const result = await fetch(siteUrl(route.path));
    assert.equal(result.status, 200, route.path);
    const html = await result.text();
    assert(
      html.includes('<main'),
      `Missing prerendered content: ${route.path}`,
    );
    for (const match of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)) {
      assert(
        match[1].startsWith(base),
        `URL escapes the Pages base: ${match[1]}`,
      );
      references.add(match[1]);
    }
  }
  for (const reference of references) {
    const result = await fetch(`${origin}${reference}`);
    assert.equal(result.status, 200, `Broken internal URL: ${reference}`);
    await result.arrayBuffer();
  }

  browser = await chromium.launch({
    channel:
      process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? undefined : 'chrome',
  });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  const missing = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) missing.push(response.url());
  });
  for (const route of routes) {
    const result = await page.goto(siteUrl(route.path));
    assert.equal(result.status(), 200, route.path);
    await expect(page.locator('main h1')).toHaveText(route.title);
  }
  await page.goto(siteUrl('/projects/alumni/'));
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Связь выпускников');
  await page.goto(siteUrl('/'));
  await page.locator('.hero-actions button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Вопросы и ответы', exact: true })
    .click();
  await expect(page).toHaveURL(siteUrl('/answers-on-questions/'));
  await page
    .getByRole('searchbox', { name: 'Найти ответ' })
    .fill('немного денег');
  await expect(page.locator('.faq details:visible')).toHaveCount(1);
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(siteUrl('/'));
    await page.evaluate(() => document.fonts.ready);
    assert(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
      `Layout overflows at ${width}px`,
    );
  }
  assert.deepEqual(missing, [], 'Missing resources');
  assert.deepEqual(errors, [], 'Browser errors');
  const unknown = await page.goto(siteUrl('/unknown-pages-check/'));
  assert.equal(unknown.status(), 404);
  await expect(page.locator('h1')).toHaveText('Страница не найдена');
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(siteUrl('/projects/alumni/'));
  await expect(staticPage.locator('h1')).toHaveText('Связь выпускников');
  assert.deepEqual(
    errors.filter((error) => !error.includes('404')),
    [],
    '404 page hydration errors',
  );
  console.log(
    `Pages OK: base ${base}, ${routes.length} routes, ${references.size} internal URLs, navigation, reload, 404, no-JS and desktop/mobile layouts.`,
  );
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
