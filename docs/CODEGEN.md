# Кодогенерация клиента API

Источник — существующий Swagger `../ZGU-endowment-server/docs/swagger.json`. Он читается без изменений серверных файлов. Генератор `swagger-typescript-api` уже установлен в devDependencies.

Из корня **клиентского** репозитория:

```sh
npm run gen:api
npm run typecheck
```

Новый коммит `d27dfa5` с `current_amount` и ручными пополнениями находится в серверной `origin/main`, а checkout Best2Pay — в `payment-system`. Пока эти изменения не объединены на сервере, генерация обоих контрактов выполняется так:

```sh
git -C ../ZGU-endowment-server fetch origin
npm run gen:api -- --server-ref origin/main
npm run typecheck
```

`scripts/generate-api.mjs` читает локальный Swagger и изменения указанной ветки относительно общего предка. При конфликте одного поля генерация останавливается. Промежуточный Swagger записывается в игнорируемый `.migration/api-codegen/`; файлы, ветка и база сервера не меняются. После объединения серверных изменений достаточно обычного `npm run gen:api` из актуальной серверной рабочей копии.

Скрипт запускает axios-генератор с модульным разделением по первому тегу, извлечением тел и ответов, union enum и type-only imports, затем форматирует результат Prettier.

Результат — `src/api/generated/`: контракты, HTTP-клиент и модули Auth, Users, News, Events, Projects, Documents, Payments. Сгенерированные файлы не редактируют вручную. Рукописные адаптеры `staff.ts`, `staff-content.ts`, `payments.ts` и `payment-analytics.ts` при генерации не затрагиваются.

Полная команда:

```sh
npx swagger-typescript-api generate --axios --path ../ZGU-endowment-server/docs/swagger.json --output ./src/api/generated --name index.ts --modular --module-name-first-tag --responses --extract-request-body --extract-response-body --extract-response-error --enum-style union --type-only-imports
```

Генерация или миграция сервера для этой операции не нужна. Если Swagger расходится с реализацией, сначала проверьте обработчики и сервисы; клиентская генерация сама не обновляет серверную спецификацию.

Базовый URL задаётся в `staff.ts` из `VITE_API_BASE_URL`, обычно `/api/v1`. Сотрудники используют сессионную cookie (`withCredentials: true`). Публичные запросы не требуют входа; аннотация `BearerAuth` в Swagger не заменяет проверку фактического роутера и обработчика.

Контракт платежей и известные ограничения: [payment-api.md](payment-api.md).
