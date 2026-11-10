import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 640 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1920, height: 1080 },
  { width: 2048, height: 1152 },
  { width: 2560, height: 1440 },
];

const routes = [
  '/',
  '/about/general-information/',
  '/about/governing-bodies/',
  '/how-to-support/',
  '/contacts-and-requisites/',
  '/projects/',
  '/news/',
  '/events/',
  '/about/constituent-the-documents/',
  '/documents/offer/',
  '/documents/payment-security/',
];

for (const viewport of viewports) {
  test(`public pages fit ${viewport.width}x${viewport.height} with enlarged text`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    for (const path of routes) {
      await page.goto(path);
      for (const enlarged of [false, true]) {
        if (enlarged)
          await page.getByRole('button', { name: 'Увеличить текст' }).click();
        const result = await page.evaluate(() => ({
          fits:
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
          clipped: [
            ...document.querySelectorAll<HTMLElement>(
              'main h1, main h2, main h3, main p, main dd, main button',
            ),
          ]
            .filter(
              (node) =>
                node.getClientRects().length &&
                node.scrollWidth > node.clientWidth + 2,
            )
            .map((node) => node.textContent),
        }));
        expect(result, `${path}, enlarged: ${enlarged}`).toEqual({
          fits: true,
          clipped: [],
        });
        if (enlarged)
          await page.getByRole('button', { name: 'Увеличить текст' }).click();
      }
    }
    if (viewport.width >= 1800) {
      await page.goto('/');
      const width = await page
        .locator('.hero-inner')
        .evaluate((node) => node.getBoundingClientRect().width);
      expect(width).toBeGreaterThanOrEqual(1600);
      expect(width).toBeLessThanOrEqual(1760);
    }
  });

  test(`donation dialogue remains usable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const trigger = page.locator('.hero-actions button');
    await trigger.click();
    const dialog = page.getByRole('dialog');
    const title = dialog.getByRole('heading', {
      name: 'Поддержим будущее университета',
    });
    const close = dialog.getByRole('button', { name: 'Закрыть', exact: true });
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    expect(
      await title.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).fontSize),
      ),
    ).toBeGreaterThanOrEqual(24);
    await expect(title).toBeInViewport();
    await expect(close).toBeInViewport();
    expect(
      await dialog
        .locator('.donation-body')
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
    await dialog
      .getByRole('button', { name: 'Другая сумма', exact: true })
      .click();
    const amount = dialog.getByLabel('Другая сумма, рублей');
    await expect(amount).toBeFocused();
    await amount.fill('2020000');
    await expect(amount).toHaveValue('2.020.000');
    const submit = dialog.getByRole('link', {
      name: 'Обсудить вклад',
      exact: true,
    });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
    const href = new URL((await submit.getAttribute('href'))!);
    expect(href.searchParams.get('body')).toContain('2020000 рублей');
    const documents = dialog.locator('.donation-documents');
    await documents.scrollIntoViewIfNeeded();
    expect((await documents.boundingBox())!.y).toBeGreaterThanOrEqual(
      (await submit.boundingBox())!.y +
        (await submit.boundingBox())!.height +
        10,
    );
    await dialog
      .locator('.donation-body')
      .evaluate((node) => (node.scrollTop = node.scrollHeight));
    await expect(title).toBeInViewport();
    await expect(close).toBeInViewport();
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('requested notes are removed and collected amount is consistent', async ({
  page,
}) => {
  for (const path of ['/', '/about/general-information/']) {
    await page.goto(path);
    await expect(page.locator('main')).not.toContainText(
      'Решения о поддержке принимаются по фактическим результатам управления',
    );
  }
  for (const path of ['/', '/anniversary/']) {
    await page.goto(path);
    const summary = page.getByRole('group', { name: 'Сбор целевого капитала' });
    await expect(summary).toContainText('2 020 000 рублей');
    await expect(summary.getByRole('progressbar')).toHaveAttribute(
      'value',
      '2020000',
    );
    await expect(summary).toContainText('2,02%');
  }
  await page.goto('/documents/payment-security/');
  await expect(page.locator('main')).not.toContainText(
    'Политика описывает платежи через Best2Pay. Сейчас обращение',
  );
  await expect(page.locator('main')).toContainText('PCI DSS');
});
