# HTTP API

Маршрути розташовані в [src/app/api](../src/app/api), виконуються в Node.js.
Типи й Zod-схеми визначені в [contracts.ts](../src/lib/contracts.ts).

## Маршрути

| Метод і шлях             | Поведінка                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `GET /api/auth/start`    | Створює/використовує сесію, починає OAuth, установлює HttpOnly cookie й робить redirect                      |
| `GET /api/auth/callback` | Перевіряє `code` і session-bound `state`, обмінює код через SDK; redirect на `/#planner` або `/?authError=1` |
| `GET /api/auth/status`   | `{ "connected": boolean }`; перевіряє наявність токена в живій сесії, без MCP-запиту                         |
| `POST /api/recipe-plan`  | Створює один план у межах автентифікованої сесії                                                             |

Статус авторизації, початок OAuth та JSON-відповіді плану використовують
`Cache-Control: no-store`. OAuth-помилки callback повертаються redirect,
а не JSON-контрактом помилки плану.

## Запит плану

Потрібні cookie `smak_session`, `Content-Type: application/json` та точний
заголовок `Origin`, рівний серверному `APP_ORIGIN`.

```json
{
  "request": "Лазанья",
  "servings": 4,
  "budgetUah": 600
}
```

- `request`: 2–1500 символів після trim.
- `servings`: ціле число від 1 до 30.
- `budgetUah`: додатне число до 100000, кратне 0.01.
- Текст тіла обмежений 8000 символами; поточна перевірка відбувається після
  `request.text()`, тобто не є потоковим обмеженням пам’яті.

Паралельний запуск у тій самій сесії відхиляється через `busy`; блокування
знімається в `finally`. Сигнал скасування запиту об’єднується з таймаутом 180 с.

## Успішна відповідь

HTTP 200 повертає `PlanResult`, включно зі статусами `over_budget` та `incomplete`.
Це результати підбору, а не помилки транспорту.

| Поле                    | Значення                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `recipe`                | `title`, `minutes`, `ingredients: { id, name, quantity, unit }[]`, `steps: string[]`                              |
| `servings`              | Кількість людей із запиту                                                                                         |
| `products`              | `ShoppingLine[]`: нормалізований Product плюс `ingredientIds`, кількість покупки `quantity`, сума рядка `lineKop` |
| `totalKop`, `budgetKop` | Сума підтверджених покупок і бюджет у копійках                                                                    |
| `differenceKop`         | Бюджет мінус сума покупок                                                                                         |
| `status`                | `within_budget`, `over_budget` або `incomplete`                                                                   |
| `missing`               | Назви непідтверджених інгредієнтів                                                                                |
| `substitutions`         | Описи змін товарів відносно першого повного кошика                                                                |
| `store`                 | Зараз узагальнений підпис магазину з кошика, не перевірена адреса                                                 |
| `checkedAt`             | ISO timestamp завершення плану, не час окремого запиту ціни кожного товару                                        |

`Product` включає `id`, `name`, `url`, `imageUrl`, `packageLabel`, `priceKop`,
`content`, `unit`, `sale`, `minOrder`, `orderStep` і необов’язковий `stock`.
Для `sale=pack` кількість означає упаковки, для поточного адаптера `sale=weight`
— кілограми. `unit` належить до `g | kg | ml | l | pcs`.

`within_budget` вимагає порожнього `missing` та `totalKop <= budgetKop`.
За `incomplete` не представляйте додатну різницю як доведену економію повної
страви. Поля рецептів і назви товарів відображайте як текст, не HTML.

## Помилки плану

JSON має форму `{ "code": "...", "message": "..." }`; статус передається HTTP.
Перетворення помилок — у [errors.ts](../src/server/errors.ts).

| HTTP            | Коди й причини                                                          |
| --------------- | ----------------------------------------------------------------------- |
| 400 / 413 / 415 | `INPUT`: некоректні поля/JSON, завелике тіло, неправильний content type |
| 401             | `AUTH_REQUIRED`: немає сесії/токенів або доступ завершився              |
| 403             | `ORIGIN`, `TOOL_FORBIDDEN`, `MCP_FORBIDDEN`                             |
| 409             | `BUSY`, `CART_CONTEXT`                                                  |
| 422             | `MCP_TOOL`: MCP повідомив про помилку операції                          |
| 429             | `CALL_LIMIT`, `RATE_LIMIT`, `AI_RATE_LIMIT`                             |
| 502             | `MCP_SCHEMA`, `RECIPE_FAILED`, `UPSTREAM_ERROR`                         |
| 503             | `CONFIG`: відсутній ключ OpenAI                                         |
| 504             | `TIMEOUT`                                                               |

Не повертайте необроблені винятки зовнішніх SDK клієнту. `SESSION_LIMIT`
виникає при створенні сесії OAuth, а не як звичайний результат recipe-plan.
