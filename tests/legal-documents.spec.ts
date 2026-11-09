import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const documents = [
  ['/documents/offer/', 'Договор пожертвования и оферта', 'donation-offer'],
  [
    '/documents/privacy/',
    'Политика обработки персональных данных',
    'privacy-policy',
  ],
  [
    '/documents/consent/',
    'Согласие на обработку персональных данных',
    'personal-data-consent',
  ],
  [
    '/documents/payment-security/',
    'Политика безопасности платежей',
    'payment-security',
  ],
] as const;

test('legal pages and all download formats work without JavaScript', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const [path, title, stem] of documents) {
    const response = await page.goto(`http://127.0.0.1:4173${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(
      page.getByRole('navigation', { name: 'Содержание документа' }),
    ).toBeVisible();
    await expect(page.locator('.legal-section p').first()).toBeVisible();
    for (const format of ['pdf', 'docx']) {
      const href = await page
        .locator('main')
        .getByRole('link', {
          name: `Скачать ${title}: ${format.toUpperCase()}`,
          exact: true,
        })
        .getAttribute('href');
      expect(href).toBe(`/documents/${stem}.${format}`);
      const file = await request.get(href!);
      expect(file.status()).toBe(200);
      const bytes = await file.body();
      expect(bytes.length).toBeGreaterThan(1000);
      expect(bytes.subarray(0, format === 'pdf' ? 5 : 2).toString()).toBe(
        format === 'pdf' ? '%PDF-' : 'PK',
      );
    }
  }
  await page.goto('http://127.0.0.1:4173/documents/offer/');
  await expect(page.locator('#appendix-1')).toContainText(
    'Целевой капитал формируются бессрочно',
  );
  await expect(page.locator('#appendix-2')).toContainText(
    'Заявление о присоединении',
  );
  await context.close();
});

test('fund contacts contain the confirmed recipient and bank details', async ({
  page,
  request,
}) => {
  await page.goto('/contacts-and-requisites/');
  const main = page.locator('main');
  await expect(main).toContainText('Ленинский проспект, д. 1, помещение 670');
  await expect(
    main.getByRole('link', { name: 'kistnerev@norvuz.ru ↗' }),
  ).toHaveAttribute('href', 'mailto:kistnerev@norvuz.ru');
  await expect(
    main.getByRole('link', { name: '+7 (952) 136-75-55', exact: true }),
  ).toHaveAttribute('href', 'tel:+79521367555');
  for (const value of [
    '2457093311',
    '245701001',
    '1262400010531',
    '40703810531710000670',
    '30101810800000000627',
    '040407627',
  ]) {
    await expect(main.locator('#requisites')).toContainText(value);
  }
  await expect(main.locator('#requisites')).not.toContainText('7707083893');
  for (const format of ['pdf', 'docx']) {
    const file = await request.get(`/documents/foundation-details.${format}`);
    expect(file.status()).toBe(200);
    const bytes = await file.body();
    expect(bytes.subarray(0, format === 'pdf' ? 5 : 2).toString()).toBe(
      format === 'pdf' ? '%PDF-' : 'PK',
    );
  }
  const download = page.waitForEvent('download');
  await main
    .getByRole('link', { name: 'Скачать Карточка фонда: PDF', exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe('foundation-details.pdf');
});

test('library files, footer and donation dialogue link to separate legal documents', async ({
  page,
}) => {
  await page.goto('/about/constituent-the-documents/');
  await page
    .getByRole('button', { name: 'Пожертвования', exact: true })
    .click();
  await expect(page.locator('.document-item:visible')).toHaveCount(5);
  for (const [path, title] of documents) {
    await expect(
      page.getByRole('link', { name: `Читать: ${title}`, exact: true }),
    ).toHaveAttribute('href', path);
  }
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Персональные данные', exact: true }),
  ).toHaveAttribute('href', '/documents/privacy/');
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Безопасность платежей', exact: true }),
  ).toHaveAttribute('href', '/documents/payment-security/');
  await page
    .getByRole('button', { name: 'Сделать вклад', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('link', { name: 'Оферта (в новой вкладке)', exact: true }),
  ).toHaveAttribute('href', '/documents/offer/');
  await expect(
    dialog.getByRole('link', { name: 'Оферта (в новой вкладке)', exact: true }),
  ).toHaveAttribute('target', '_blank');
  await expect(
    dialog.getByRole('link', { name: 'Обсудить вклад', exact: true }),
  ).toHaveAttribute('href', /^mailto:kistnerev@norvuz.ru\?/);
  await expect(dialog).toContainText('не списывает средства');
});

test('payment policy includes supplied logos and working HTTPS provider links', async ({
  page,
}) => {
  await page.goto('/documents/payment-security/');
  const logos = page.locator('.payment-systems');
  await expect(logos.locator('img')).toHaveCount(4);
  for (const name of ['Visa', 'MasterCard', 'МИР', 'Best2Pay']) {
    await expect(logos.getByRole('img', { name, exact: true })).toBeVisible();
  }
  await expect(page.locator('#security')).toContainText('TLS 1.2');
  await expect(page.locator('#security')).toContainText('PCI DSS');
  await expect(page.locator('#refund')).toContainText('на ту же самую карту');
  await expect(page.locator('#aggregator a')).toHaveAttribute(
    'href',
    'https://best2pay.net/docs/settlement-banks.pdf',
  );
  for (const href of await page
    .locator('.legal-paper a[href^="http"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))) {
    expect(href).toMatch(/^https:\/\//);
  }
});

for (const width of [360, 768, 1440]) {
  test(`legal pages fit at ${width}px and keep text readable when enlarged`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      ...documents.map((document) => document[0]),
      '/contacts-and-requisites/',
      '/about/constituent-the-documents/',
    ]) {
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
        if (enlarged)
          await page.getByRole('button', { name: 'Увеличить текст' }).click();
      }
    }
  });
}

for (const [path] of documents) {
  test(`legal page accessibility ${path}`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}
