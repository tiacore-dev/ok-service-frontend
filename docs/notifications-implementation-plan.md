# План реализации уведомлений и Web Push

## Цель

Реализовать пользовательские уведомления, Web Push через Firebase Cloud Messaging, управление подписками, административный просмотр уведомлений и массовую отправку.

Frontend использует существующую авторизацию и отправляет запросы с текущим access JWT и `withCredentials: true`. Cookie `browser_id` не читается через JavaScript.

## Backend-контракты

### Уведомления пользователя

- `GET /notifications?offset={offset}&limit={limit}`
- `GET /notifications/unread-count`
- `POST /notifications/{notification_id}/view`

Ожидаемые поля уведомления:

```ts
{
  notification_id: string;
  title: string;
  body: string;
  route: string | null;
  created_at: number;
  viewed: boolean;
  viewed_at: number | null;
}
```

`browser_id` обычному пользователю не показывается.

### Подписки текущего пользователя

- `PUT /notifications/push/subscription`
- `GET /notifications/push/subscriptions`
- `DELETE /notifications/push/subscriptions/{subscription_id}`

Регистрация:

```json
{
  "platform": "web",
  "token": "FCM registration token"
}
```

В списке подписок backend не возвращает push token.

### Административные endpoints

- `GET /notifications/admin/users/{user_id}?offset={offset}&limit={limit}`
- `GET /notifications/admin/users/{user_id}/push/subscriptions?offset={offset}&limit={limit}`

Административный просмотр не помечает уведомления просмотренными.

### Массовая отправка

- `POST /notifications/admin/bulk`

```json
{
  "recipient_user_ids": ["uuid"],
  "title": "Заголовок",
  "text": "Текст",
  "link": "/shifts/{shift_id}",
  "idempotency_key": "uuid"
}
```

`link` необязателен. В push payload backend передаёт его как `route`.

## Окружения и env

Используются одинаковые имена переменных и разные значения для каждого окружения:

- `.env.development`
- `.env.test`
- `.env.staging`
- `.env.production`

Переменные Firebase:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=
```

Dev-конфигурация использует проект `ok-dev-f8cc3`. Production не должен использовать dev Firebase project, FCM token или VAPID key.

## ✅ Этап 1. Общая инфраструктура

### 1.1. Типы

Создать общие типы:

- `INotification`;
- `INotificationListResponse`;
- `INotificationSubscription`;
- `INotificationSubscriptionListResponse`;
- payload регистрации подписки;
- payload массовой отправки;
- enum/union для `platform`.

Поля типов должны соответствовать backend без legacy-вариантов.

### 1.2. API-слой

Добавить отдельные API-модули только для HTTP-запросов:

- notifications API;
- notification subscriptions API;
- admin notifications API.

Компоненты не импортируют API напрямую.

### 1.3. React Query hooks

Создать hooks для:

- списка уведомлений;
- счётчика непросмотренных;
- пометки просмотренным;
- списка своих подписок;
- удаления своей подписки;
- административного списка уведомлений;
- административного списка подписок;
- массовой отправки.

Для каждого запроса предусмотреть `isLoading`, `isError`, `isEmpty`.

Для каждой мутации предусмотреть `onError` с сообщением backend.

### 1.4. Query keys и invalidation

Создать единые query keys:

- `notificationsKeys.list()`;
- `notificationsKeys.unreadCount()`;
- `notificationsKeys.adminList(userId)`;
- `notificationSubscriptionsKeys.mine()`;
- `notificationSubscriptionsKeys.admin(userId)`.

После просмотра уведомления обновлять список и счётчик. После удаления подписки обновлять список подписок.

### 1.5. Общий переход по route

Создать helper:

- если `route` непустой и является внутренним маршрутом — использовать `navigate(route)`;
- если `route` отсутствует или некорректен — не выполнять переход;
- удалённая или недоступная сущность должна показывать понятное сообщение.

## ✅ Этап 2. OK-137: пользовательские уведомления

### ✅ 2.1. Колокольчик

Добавить компонент в верхнюю панель приложения:

- иконка колокольчика;
- badge со значением unread count;
- отсутствие badge при нулевом количестве;
- доступность для keyboard navigation.

Не использовать polling.

### ✅ 2.2. Dropdown

При открытии dropdown:

- загрузить список последних уведомлений с `limit` небольшого размера;
- показать loading/error/empty state;
- отображать title, body, дату и состояние viewed;
- непросмотренные уведомления визуально выделять;
- по клику переходить по `route`;
- после успешного открытия помечать уведомление просмотренным;
- обновлять unread count.

Добавить ссылку на полную страницу уведомлений.

### ✅ 2.3. Полная история

Создать страницу пользовательских уведомлений:

- пагинация через `offset`/`limit`;
- стабильный порядок backend;
- title, body, дата создания;
- viewed/viewed_at;
- переход по route;
- состояния загрузки, ошибки и пустого списка.

### ✅ 2.4. Мои устройства

Добавить раздел собственных подписок:

- показывать только активные подписки;
- отображать платформу, даты создания/обновления;
- не показывать subscription token и browser_id;
- удаление подписки через подтверждение;
- после удаления обновлять список.

## Этап 3. OK-42: Firebase Web Push

### ✅ 3.1. Зависимость Firebase

Добавить Firebase SDK для messaging. Analytics не подключать без отдельной задачи.

Инициализировать Firebase из `REACT_APP_FIREBASE_*`.

### ✅ 3.2. Service worker

Создать/обновить service worker по адресу, доступному из корня приложения:

```text
/firebase-messaging-sw.js
```

Service worker должен:

- принимать background message;
- показывать системное уведомление;
- сохранять в notification data `notification_id` и `route`;
- обрабатывать `notificationclick`;
- открывать `route`, если он есть;
- не помечать уведомление просмотренным при доставке.

### ✅ 3.3. Разрешение уведомлений

Не запрашивать permission при загрузке приложения.

Запрашивать разрешение только после явного действия пользователя, например кнопки «Включить уведомления».

Обработать состояния:

- разрешено;
- отклонено;
- браузер не поддерживает push;
- ошибка Firebase;
- пользователь уже отказал в настройках браузера.

### ✅ 3.4. Получение и регистрация FCM token

После разрешения:

1. зарегистрировать service worker;
2. вызвать `getToken` с `REACT_APP_FIREBASE_VAPID_KEY`;
3. отправить token на `PUT /notifications/push/subscription` с `platform: "web"`;
4. обновить список устройств;
5. не создавать повторные локальные подписки.

При повторной регистрации одного браузера backend должен сохранить одну активную подписку.

### ✅ 3.5. Foreground messages

Подключить `onMessage` в приложении:

- показать уведомление внутри интерфейса или обновить dropdown;
- инвалидировать список и unread count;
- не считать уведомление просмотренным автоматически.

### ✅ 3.6. Удаление подписки

Удаление собственной подписки:

- вызвать backend DELETE;
- удалить локальное состояние подписки;
- обновить список устройств;
- не удалять cookie `browser_id`.

## Этап 4. OK-139: административная карточка пользователя

### ✅ 4.1. История уведомлений

В карточке пользователя добавить секцию уведомлений:

- запрос только для администратора;
- пагинация;
- title, body, route, дата создания;
- viewed/viewed_at;
- browser_id не показывать в обычном UI без отдельного требования.

Просмотр администратором не вызывает endpoint `/view`.

### ✅ 4.2. Устройства пользователя

Добавить секцию устройств:

- платформа;
- active;
- created_at;
- updated_at;
- revoked_at, если возвращается backend.

Не показывать:

- push token;
- browser_id;
- subscription_id.

Удаление чужой подписки не добавлять: backend-контракт предоставляет административное чтение, а не отзыв чужих устройств.

Фильтры добавлять только если они появятся в backend API. Сейчас предусмотрены только `offset` и `limit`.

## Этап 5. OK-138: массовое уведомление

### ✅ 5.1. Выбор пользователей

В списке пользователей:

- включить множественный выбор;
- добавить действие только для admin;
- не менять выбранных пользователей при открытии/закрытии модального окна.

### ✅ 5.2. Форма

Поля:

- список выбранных пользователей;
- заголовок — обязательный;
- текст — обязательный;
- route/link — необязательный.

Ссылка должна быть внутренним маршрутом приложения, например `/shifts/{id}`.

### ✅ 5.3. Отправка

- генерировать новый UUID `idempotency_key` для новой отправки;
- блокировать повторное нажатие;
- отправлять только выбранных пользователей;
- не ограничивать количество получателей на frontend;
- отображать общий результат backend;
- при ошибке сохранять введённый текст и выбранных пользователей.

## Этап 6. Финальная проверка

Проверить:

- вход и авторизованные запросы;
- работу `browser_id` через `withCredentials`;
- dev/test/stage/prod env;
- разрешение и отказ браузера;
- повторную регистрацию подписки;
- удаление своей подписки;
- foreground push;
- background push;
- открытие route по клику;
- отсутствие автоматической отметки viewed при доставке;
- пагинацию истории;
- административный просмотр без изменения viewed;
- массовую отправку и повтор с тем же idempotency key.

Перед завершением каждого этапа выполнить:

```bash
npx tsc --noEmit --skipLibCheck
npx eslint <изменённые-файлы>
git diff --check
```

Не выполнять `npm run build` локально — сборка выполняется CI.
