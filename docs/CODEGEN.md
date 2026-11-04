# Кодогенерация клиента API

Клиент TypeScript собирается пакетом [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) (npm, MIT, автор Сергей Волков / acacode). Пакет читает Swagger 2.0, который уже пишет swag, и генерирует типы и axios-клиент. У генератора по умолчанию fetch, axios включается флагом `--axios`.

Спека: `server/docs/swagger.json`. Результат кладётся в `client/src/api/generated` и не затирает рукописный `src/api/staff.ts`. Сгенерированные файлы не правят вручную: после изменения API их перезаписывают.

## Обновить спеку

Из каталога `server`:

```sh
go generate ./cmd/main
```

Команда записана в `server/cmd/main/main.go` и заново собирает `server/docs/swagger.json` и `server/docs/swagger.yaml` из комментариев хендлеров.

## Сгенерировать клиент

Из каталога `client`, один раз:

```sh
npm install axios
npm install --save-dev swagger-typescript-api
```

`axios` нужен в `dependencies`: сгенерированный код импортирует его в рантайме. Генератор остаётся в `devDependencies`.

Запуск:

```sh
npx swagger-typescript-api generate --axios --path ../server/docs/swagger.json --output ./src/api/generated --name index.ts --modular --module-name-first-tag --responses --extract-request-body --extract-response-body --extract-response-error --enum-style union --type-only-imports
```

Ту же строку можно положить в `package.json` как `gen:api`. В конфиге то же самое задаётся полем `httpClientType: "axios"`. Флаг `--http-client` не используйте: в текущем CLI он выбирает axios при любом непустом значении, но надёжный переключатель именно `--axios`.

`--modular` раскладывает HTTP-клиент, контракты и маршруты по файлам. `--module-name-first-tag` делит методы по первому тегу swag: `auth`, `users`, `events`, `news`, `projects`, `documents`.

## Конфиг

Рядом с запуском CLI ищет `swagger-typescript-api.config.ts`. Другой файл указывается флагом `--custom-config`. Поля конфига перекрывают флаги командной строки.

```ts
import type { GenerateApiParams } from 'swagger-typescript-api';

const config: GenerateApiParams = {
  input: '../server/docs/swagger.json',
  output: './src/api/generated',
  fileName: 'index.ts',
  httpClientType: 'axios',
  modular: true,
  moduleNameFirstTag: true,
  generateResponses: true,
  extractRequestBody: true,
  extractResponseBody: true,
  extractResponseError: true,
  enumStyle: 'union',
  typeOnlyImports: true,
};

export default config;
```

`generateClient: false` оставляет только типы. `cleanOutput: true` очищает каталог вывода перед записью. `hooks` переименовывает типы и методы. Свои шаблоны выгружаются так:

```sh
npx swagger-typescript-api generate-templates --output ./api-templates --modular
```

Их передают в генерацию флагом `--templates ./api-templates`.

## Вызов

В спеке нет хоста, только `/api/v1`. Базовый URL задают в конструкторе сгенерированного класса, тем же значением, что `VITE_API_BASE_URL`.

Схема `BearerAuth` описана как заголовок `Authorization`. Токен передают через security data класса. Префикс `Bearer` сервер принимает, но не требует. Cookie `session` в спеке нет, поэтому сгенерированный axios её не отправляет. Для cookie нужен свой `withCredentials: true` в конфиге экземпляра.

Генератор повторяет комментарии swag. У части публичных `GET` в спеке стоит `BearerAuth`, хотя сервер пускает их без сессии. Пока комментарии не поправлены, такие методы в клиенте тоже требуют авторизацию.
