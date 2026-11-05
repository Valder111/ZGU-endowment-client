import { expect, test, type Page } from '@playwright/test';

type Collection = 'news' | 'events' | 'projects' | 'documents';
type RecordData = Record<string, string | number>;

async function mockApi(page: Page) {
  const records: Record<Collection, RecordData[]> = {
    news: [
      {
        id: 'news-1',
        title: 'Открытие фонда',
        body: 'Первая новость фонда',
        category: 'Жизнь фонда',
        status: 'published',
      },
      {
        id: 'private-news',
        title: 'Внутренняя новость',
        body: 'Материал редакции',
        category: 'Жизнь фонда',
        status: 'draft',
      },
    ],
    events: [
      {
        id: 'event-1',
        name: 'Встреча выпускников',
        description: 'Программа встречи',
        category: 'Выпускники',
        event_status: 'scheduled',
        publication_status: 'published',
      },
    ],
    projects: [
      {
        id: 'project-1',
        name: 'Лаборатория',
        description: 'Оборудование для лаборатории',
        category: 'Наука',
        status: 'completed',
        published_at: '2026-10-01T08:00:00Z',
      },
    ],
    documents: [
      {
        id: 'document-1',
        title: 'Устав',
        description: 'Действующий устав фонда',
        category: 'Учредительные',
        status: 'published',
        original_filename: 'charter.pdf',
      },
    ],
  };
  const writes: { collection: Collection; body: RecordData }[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const [endpoint, id, action, mediaId, mediaAction] = new URL(
      request.url(),
    ).pathname
      .replace(/^\/api\/v1\//, '')
      .split('/');
    if (endpoint === 'login')
      return route.fulfill({ json: { role: 'moderator' } });
    if (endpoint === 'me')
      return route.fulfill({
        json: {
          id: 'staff-1',
          role: 'moderator',
          is_active: true,
          email: 'editor@example.test',
        },
      });
    const collection = endpoint as Collection;
    if (!Object.hasOwn(records, collection))
      return route.fulfill({ status: 404 });
    const rows = records[collection];
    const row = rows.find((item) => item.id === id);
    if (request.method() === 'GET') {
      if (action === 'media') {
        const newsPhotos = collection === 'news' && id === 'news-1';
        if (newsPhotos && mediaId && mediaAction === 'content') {
          return route.fulfill({
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#23676b"/></svg>',
          });
        }
        return route.fulfill({
          json: newsPhotos ? [{ id: 'cover' }, { id: 'gallery' }] : [],
        });
      }
      if (action === 'content')
        return route.fulfill({
          contentType: 'application/pdf',
          body: '%PDF-1.4',
        });
      if (!id) return route.fulfill({ json: rows });
      return row
        ? route.fulfill({ json: row })
        : route.fulfill({ status: 404 });
    }
    if (
      action === 'publish' &&
      row &&
      ['news', 'documents'].includes(collection)
    ) {
      row.status = 'published';
      return route.fulfill({ status: 204 });
    }
    if (action === 'finish' && row && collection === 'events') {
      row.event_status = 'finished';
      return route.fulfill({ status: 204 });
    }
    if (action) return route.fulfill({ status: 404 });
    let body: RecordData;
    if (collection === 'documents' && request.method() === 'POST') {
      const multipart = request.postData() ?? '';
      body = Object.fromEntries(
        [
          ...multipart.matchAll(
            /name="(title|category|status)"\r\n\r\n([^\r\n]+)/g,
          ),
        ].map(([, key, value]) => [key, value]),
      );
      body.original_filename = multipart.match(/filename="([^"]+)"/)?.[1] ?? '';
    } else {
      body = request.postDataJSON();
    }
    if (row) {
      const editable = {
        news: ['title', 'summary', 'body', 'category'],
        events: ['name', 'type', 'description', 'location', 'category'],
        projects: [
          'name',
          'short_description',
          'description',
          'target_amount',
          'category',
        ],
        documents: ['title', 'description', 'category', 'reporting_year'],
      }[collection];
      if (!Object.keys(body).every((field) => editable.includes(field)))
        return route.fulfill({ status: 400 });
      writes.push({ collection, body });
      Object.assign(row, body);
      return route.fulfill({ status: 204 });
    }
    if (collection !== 'documents' && !String(body.category ?? '').trim())
      return route.fulfill({
        status: 400,
        json: { error: 'Укажите категорию' },
      });
    if (collection === 'news' && !String(body.summary ?? '').trim())
      return route.fulfill({ status: 500, json: { error: 'internal error' } });
    writes.push({ collection, body });
    const created = { id: `${collection}-${rows.length + 1}`, ...body };
    rows.unshift(created);
    return route.fulfill({ status: 201, json: created });
  });
  return writes;
}

async function openEditor(page: Page) {
  await page.goto('/moderator/');
  test.skip(
    !(await page.getByLabel('Рабочая почта').count()),
    'Build with VITE_API_BASE_URL=/api/v1 to test the API-enabled editor.',
  );
  await page.getByLabel('Рабочая почта').fill('editor@example.test');
  await page.getByLabel('Пароль').fill('test-password');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(
    page.getByRole('button', { name: 'Новая новость' }),
  ).toBeVisible();
}

test('autosaves new and published records on idle and on leaving the editor', async ({
  page,
}) => {
  const writes = await mockApi(page);
  await page.clock.install();
  await openEditor(page);
  await page.getByRole('button', { name: 'Новая новость' }).click();
  await page.getByLabel('Заголовок').fill('Новая запись');
  await page.getByLabel('Текст новости').fill('Текст новой записи');
  await expect(page.getByText('Черновик', { exact: true })).toHaveCount(0);
  await page.clock.runFor(7_000);
  await expect(page.getByRole('alert')).toHaveText(
    'Заполните поле «Категория».',
  );
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Показать категории' }).click();
  await expect(
    page.getByRole('option', { name: 'Жизнь фонда', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Категория', { exact: true }).fill('жизнь фонда');
  await page.clock.runFor(7_000);
  await expect(page.getByRole('alert')).toHaveText(
    'Заполните поле «Краткое описание».',
  );
  expect(writes).toHaveLength(0);
  await page.getByLabel('Краткое описание').fill('Анонс новой записи');
  await page.clock.runFor(6_000);
  expect(writes).toHaveLength(0);
  await page.clock.runFor(1_000);
  await expect(
    page.getByRole('heading', { name: 'Новая запись' }),
  ).toBeVisible();
  expect(writes).toEqual([
    {
      collection: 'news',
      body: {
        title: 'Новая запись',
        body: 'Текст новой записи',
        category: 'Жизнь фонда',
        summary: 'Анонс новой записи',
        status: 'draft',
      },
    },
  ]);
  await page.getByRole('button', { name: 'Опубликовать' }).click();
  await expect(page.getByText('Запись опубликована.')).toBeVisible();
  await page.getByLabel('Текст новости').fill('Правка опубликованной новости');
  await page.clock.runFor(7_000);
  await expect(page.getByText('Изменения сохранены.')).toBeVisible();
  expect(writes.at(-1)?.body).toEqual({
    body: 'Правка опубликованной новости',
  });
  await page.getByLabel('Заголовок').fill('Обновлённый заголовок');
  await page.getByRole('button', { name: 'Проекты', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Новый проект' }),
  ).toBeVisible();
  expect(writes.at(-1)?.body).toEqual({ title: 'Обновлённый заголовок' });

  await page.getByRole('button', { name: 'Новый проект' }).click();
  await page.getByLabel('Название').fill('Новый сбор');
  await page.getByLabel('Категория', { exact: true }).fill('Исследования');
  await page.getByLabel('Описание', { exact: true }).fill('Описание проекта');
  await page.getByLabel('Целевая сумма').fill('150000,5');
  await expect(page.getByLabel('Целевая сумма')).toHaveValue('150.000,5');
  await page.getByLabel('Целевая сумма').blur();
  await expect(page.getByLabel('Целевая сумма')).toHaveValue('150.000,50');
  await page.clock.runFor(7_000);
  await expect(
    page.getByText('Введённые данные сохранены в этом браузере.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Документы', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Новый документ' }),
  ).toBeVisible();
  expect(writes.some(({ collection }) => collection === 'projects')).toBe(
    false,
  );
  await page.getByRole('button', { name: 'Проекты', exact: true }).click();
  await page.getByRole('button', { name: 'Новый проект' }).click();
  await expect(page.getByLabel('Название')).toHaveValue('Новый сбор');
  await page.getByRole('button', { name: 'Опубликовать' }).click();
  await expect(page.getByText('Запись опубликована.')).toBeVisible();
  expect(writes.at(-1)).toMatchObject({
    collection: 'projects',
    body: {
      name: 'Новый сбор',
      category: 'Исследования',
      target_amount: '150000.50',
      status: 'published',
    },
  });
  await expect(page.getByLabel('Валюта')).toHaveCount(0);
  await page.getByLabel('Целевая сумма').fill('200000');
  await expect(page.getByLabel('Целевая сумма')).toHaveValue('200.000');
  await page.getByRole('button', { name: 'События', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Новое событие' }),
  ).toBeVisible();
  expect(writes.at(-1)?.body).toEqual({ target_amount: '200000.00' });

  await page.getByRole('button', { name: /Встреча выпускников/ }).click();
  await page.getByLabel('Место проведения').fill('Актовый зал');
  await page.getByLabel('Категория', { exact: true }).fill('Встречи');
  await page.getByRole('button', { name: 'Завершить событие' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Завершить событие' })
    .click();
  await expect(page.getByText('Событие завершено.')).toBeVisible();
  expect(writes.at(-1)?.body).toEqual({
    location: 'Актовый зал',
    category: 'Встречи',
  });

  await page.getByRole('button', { name: 'Новое событие' }).click();
  await page.getByLabel('Название').fill('Форум выпускников');
  await page.getByLabel('Тип события').fill('Форум');
  await page.getByLabel('Категория', { exact: true }).fill('Встречи');
  await page.getByLabel('Описание').fill('Программа форума');
  await page.getByLabel('Начало', { exact: true }).fill('2026-12-01T10:00');
  await page.getByLabel('Окончание', { exact: true }).fill('2026-12-01T14:00');
  await page.getByRole('button', { name: 'Опубликовать' }).click();
  await expect(page.getByText('Запись опубликована.')).toBeVisible();
  expect(writes.at(-1)).toMatchObject({
    collection: 'events',
    body: {
      name: 'Форум выпускников',
      category: 'Встречи',
      publication_status: 'published',
    },
  });
});

test('recovers an unfinished document with its file and suggests newly saved categories', async ({
  page,
}) => {
  const writes = await mockApi(page);
  await openEditor(page);
  await page.getByRole('button', { name: 'Документы', exact: true }).click();
  await page.getByRole('button', { name: 'Новый документ' }).click();
  await page.getByRole('button', { name: 'Показать категории' }).click();
  for (const category of [
    'Учредительные',
    'Пожертвования',
    'Отчётность',
    'Управление',
  ]) {
    await expect(
      page.getByRole('option', { name: category, exact: true }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole('option', { name: 'Все материалы', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Категория', { exact: true }).fill('Решения совета');
  await page.getByRole('option', { name: 'Добавить «Решения совета»' }).click();
  await page.getByLabel('Прикрепить документ').setInputFiles({
    name: 'decision.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  });
  await page.getByRole('button', { name: 'Новости', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Новая новость' }),
  ).toBeVisible();
  expect(writes).toHaveLength(0);
  await page.reload();
  await page.getByRole('button', { name: 'Документы', exact: true }).click();
  await page.getByRole('button', { name: 'Новый документ' }).click();
  await expect(page.getByLabel('Категория', { exact: true })).toHaveValue(
    'Решения совета',
  );
  await page.getByRole('button', { name: 'Показать категории' }).click();
  await expect(
    page.getByRole('option', { name: 'Решения совета', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Категория', { exact: true }).press('Escape');
  await expect(page.getByText('decision.pdf', { exact: true })).toBeVisible();
  await page.getByLabel('Заголовок').fill('Решение №1');
  await page.getByRole('button', { name: 'Опубликовать' }).click();
  await expect(page.getByText('Запись опубликована.')).toBeVisible();
  expect(writes.at(-1)).toMatchObject({
    collection: 'documents',
    body: {
      category: 'Решения совета',
      status: 'published',
      original_filename: 'decision.pdf',
    },
  });
  await page.getByRole('button', { name: 'Новый документ' }).click();
  await page.getByRole('button', { name: 'Показать категории' }).click();
  await expect(
    page.getByRole('option', { name: 'Решения совета', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Решение №1/ }).click();
  await page.getByLabel('Категория', { exact: true }).fill('Протоколы');
  await page.getByRole('button', { name: 'Сохранить изменения' }).click();
  await expect(page.getByText('Изменения сохранены.')).toBeVisible();
  expect(writes.at(-1)).toEqual({
    collection: 'documents',
    body: { category: 'Протоколы' },
  });
});

test('public cards for every collection open reloadable detail pages', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/moderator/');
  test.skip(
    !(await page.getByLabel('Рабочая почта').count()),
    'Build with VITE_API_BASE_URL=/api/v1 to test public API content.',
  );
  for (const [path, title, body] of [
    ['/news/', 'Открытие фонда', 'Первая новость фонда'],
    ['/events/', 'Встреча выпускников', 'Программа встречи'],
    ['/projects/', 'Лаборатория', 'Оборудование для лаборатории'],
    ['/about/constituent-the-documents/', 'Устав', 'Действующий устав фонда'],
  ] as const) {
    await page.goto(path);
    const document = path === '/about/constituent-the-documents/';
    if (document) {
      const card = page.locator('.published-document');
      const download = page.waitForEvent('download');
      await card.getByRole('button', { name: 'Скачать файл' }).click();
      expect((await download).suggestedFilename()).toBe('charter.pdf');
    }
    await page
      .locator('.published-grid')
      .getByRole('link', {
        name: document ? `Подробнее — ${title}` : title,
        exact: true,
      })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.publication-text')).toHaveText(body);
    if (path === '/news/') {
      const hero = page.getByRole('img', {
        name: `Фотография к публикации «${title}»`,
      });
      await expect
        .poll(() => hero.evaluate((img: HTMLImageElement) => img.naturalHeight))
        .toBe(600);
      await expect(hero).toHaveCSS('object-fit', 'contain');
      await expect(
        page.getByRole('heading', { name: 'Фотографии' }),
      ).toBeVisible();
      const galleryImage = page.getByRole('img', {
        name: `Фотография 2 к публикации «${title}»`,
      });
      await expect
        .poll(() =>
          galleryImage.evaluate((img: HTMLImageElement) => img.naturalHeight),
        )
        .toBe(600);
    }
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  }
  const download = page.waitForEvent('download');
  await expect(
    page.locator('.publication-body').getByText('Учредительные'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Скачать файл' }).click();
  expect((await download).suggestedFilename()).toBe('charter.pdf');
  await page.goto('/news/');
  await expect(
    page
      .locator('.published-grid')
      .getByRole('link', { name: 'Открытие фонда' }),
  ).toBeVisible();
  const grid = page.locator('.published-grid');
  const cover = grid.locator('.published-cover');
  const photo = cover.locator('img');
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalHeight))
    .toBe(600);
  await expect(photo).toHaveCSS('object-fit', 'contain');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      (await grid.locator('.published-card').boundingBox())?.width,
    ).toBeCloseTo((await grid.boundingBox())?.width ?? 0);
    expect((await cover.boundingBox())?.height).toBeGreaterThan(180);
  }
  await expect(
    page.getByRole('link', { name: 'Внутренняя новость' }),
  ).toHaveCount(0);
  await page.goto('/publications/?type=news&id=private-news');
  await expect(
    page.getByText('Публикация недоступна. Вернитесь к списку материалов.'),
  ).toBeVisible();
});
