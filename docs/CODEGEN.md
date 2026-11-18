# Кодогенерация клиента API

Источник — существующий Swagger `../ZGU-endowment-server/docs/swagger.json`. Он читается без изменений серверных файлов. Генератор `swagger-typescript-api` уже установлен в devDependencies.

Из корня **клиентского** репозитория:

```sh
npm run gen:api
npm run typecheck
```

Скрипт запускает axios-генератор с модульным разделением по первому тегу, извлечением тел и ответов, union enum и type-only imports, затем форматирует результат Prettier.

Результат — `src/api/generated/`: контракты, HTTP-клиент и модули Auth, Users, News, Events, Projects, Documents, Payments. Сгенерированные файлы не редактируют вручную. Рукописные адаптеры `staff.ts`, `staff-content.ts`, `payments.ts` и `payment-analytics.ts` при генерации не затрагиваются.

Полная команда:

```sh
npx swagger-typescript-api generate --axios --path ../ZGU-endowment-server/docs/swagger.json --output ./src/api/generated --name index.ts --modular --module-name-first-tag --responses --extract-request-body --extract-response-body --extract-response-error --enum-style union --type-only-imports
```

Генерация или миграция сервера для этой операции не нужна. Если Swagger расходится с реализацией, сначала проверьте обработчики и сервисы; клиентская генерация сама не обновляет серверную спецификацию.

Базовый URL задаётся в `staff.ts` из `VITE_API_BASE_URL`, обычно `/api/v1`. Сотрудники используют сессионную cookie (`withCredentials: true`). Публичные запросы не требуют входа; аннотация `BearerAuth` в Swagger не заменяет проверку фактического роутера и обработчика.

Контракт платежей и известные ограничения: [payment-api.md](payment-api.md).
