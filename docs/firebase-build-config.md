# Настройки Firebase при сборке

GitHub Actions выбирает секреты по ветке: `dev` — `DEV`, `stage` — `STAGE`,
`master` — `PROD`. Для каждого окружения в GitHub Actions нужно создать
repository secrets, заменив `<ENV>` соответствующим суффиксом:

- `REACT_APP_FIREBASE_API_KEY_<ENV>`
- `REACT_APP_FIREBASE_AUTH_DOMAIN_<ENV>`
- `REACT_APP_FIREBASE_PROJECT_ID_<ENV>`
- `REACT_APP_FIREBASE_STORAGE_BUCKET_<ENV>`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID_<ENV>`
- `REACT_APP_FIREBASE_APP_ID_<ENV>`
- `REACT_APP_FIREBASE_VAPID_KEY_<ENV>`

Значения передаются Docker при сборке и включаются в клиентское приложение
Webpack. Для изменения настроек нужна новая сборка образа. Клиентские
настройки доступны в браузере: не используйте здесь приватные серверные ключи.
Если любой из семи аргументов не передан или пуст, сборка завершается ошибкой
до установки зависимостей. Проверка не подтверждает корректность значений.
