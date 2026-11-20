# Релизы frontend (production)

Production-версии frontend выпускаются автоматически из `master` по SemVer и Conventional Commits — по той же политике, что в plan-tuner. Версии frontend и backend независимы. Workflow: `.github/workflows/deploy.yml`.

## Источник истины

- **Аннотированные git-теги `vX.Y.Z`** этого репозитория. Тег ставится только на коммит, деплой которого проверен на production.
- **GitHub Releases** — история релизов: версия, дата (UTC), изменения по группам, коммит, digest образа, ссылка на запуск Actions.
- `package.json`/`package-lock.json` при релизах **не меняются** (версия `1.1.0` там историческая и на расчёт не влияет). `CHANGELOG.md` ведётся вручную.
- Образ: `<DOCKERHUB_USERNAME>/ok-service-frontend:X.Y.Z` (Docker Hub, тег без `v`). Тег `X.Y.Z` никогда не перезаписывается.

## Расчёт версии

`sh scripts/release-version.sh next` (основан на скрипте plan-tuner; проверка — `sh scripts/release-version.test.sh`):

1. HEAD уже помечен `vX.Y.Z` → эта версия (повтор выпущенного релиза).
2. HEAD не содержит наибольший тег → ошибка: старая ревизия поверх новой не выпускается.
3. Тегов `vX.Y.Z` нет → **`1.0.0`**, независимо от истории и `package.json`.
4. Иначе — наибольшее повышение среди не-merge коммитов после последнего тега (включая пришедшие через merge):

| Коммит | Повышение |
| --- | --- |
| `fix:`, `perf:` | PATCH |
| `feat:` | MINOR |
| `type!:`, `type(scope)!:`, футер `BREAKING CHANGE:` / `BREAKING-CHANGE:` | MAJOR |

Scope допустим (`fix(shifts): OK-150 ...`). `docs`, `chore`, `ci`, `refactor` и т. п. релиз не вызывают: если в `master` пришли только они, production не собирается и не деплоится. Изменение, которое должно попасть в production, оформляйте как `fix:`.

## Ветки

| Ветка | Образ | Релиз |
| --- | --- | --- |
| `dev`, `stage` | `<sha>`, деплой как раньше | нет |
| `master` | кандидат `prod-<sha>` → тот же digest получает `X.Y.Z` (`--prefer-index=false`) | да |

Кандидат `prod-<sha>` собирается только с production API URL и Firebase. Образ `<sha>` той же ревизии из dev/stage содержит другие настройки и никогда не продвигается.

## Production-последовательность

Все запуски `master` сериализованы (`concurrency: ok-service-frontend-production`, без отмены идущего запуска; ожидающий запуск вытесняется более новым). Решение принимает `sh scripts/release-version.sh plan <image>` — одна и та же проверка в build, перед деплоем и перед публикацией.

1. **build-and-push / Select production version** (`plan`) определяет состояние. Ошибка чтения `origin/master` или registry — ошибка запуска, а не «ничего не делать».
   - SHA запуска = вершина `master`:
     - `none` — нет релизных коммитов;
     - `new` — версии `X.Y.Z` в registry нет: сборка `prod-<sha>`, затем `promote`;
     - `resume` / `released` — `X.Y.Z` уже принадлежит этому коммиту (проверка владения ниже); `released`, если есть тег `vX.Y.Z`;
     - `X.Y.Z` принадлежит другому коммиту, тега нет — **запуск падает** (см. «Promoted release overtaken by master»).
   - SHA запуска старше вершины `master`:
     - не в истории `origin/master` (переписанная история) — **ошибка**;
     - нет `prod-<sha>`, нет `X.Y.Z` или `X.Y.Z` чужой — `outdated`: ничего не делаем, релиз выпустит более новый запуск;
     - `X.Y.Z` принадлежит этому коммиту — `resume` / `released`: запуск **доводит свой релиз до конца**, хотя `master` ушёл вперёд.
   - **Владение** `X.Y.Z` коммитом: `prod-<sha>` и `X.Y.Z` — один digest; метки `org.opencontainers.image.revision`=SHA и `.version`=X.Y.Z; нет тега выше `vX.Y.Z`; существующий `vX.Y.Z` — аннотированный и указывает ровно на SHA. Разные digest при метке этого коммита — ошибка, ничего не перезаписывается.
   - Отсутствие тега распознаётся только по ответу registry `<ref>: not found`; ошибки авторизации, сети и чтения манифеста останавливают запуск.
2. **promote** (`release-version.sh promote`): digest `prod-<sha>` должен совпасть с digest сборки; `docker buildx imagetools create --prefer-index=false` ставит `X.Y.Z` на тот же digest (одиночный манифест не оборачивается в index), затем `X.Y.Z` перечитывается и сверяется. Существующий `X.Y.Z` принимается только с тем же digest.
3. **deploy** повторяет `plan` и требует `resume` с той же версией и digest, затем запускает на сервере `scripts/deploy-production.sh deploy` (скрипт из коммита запуска, по SSH). Что может измениться к каждому моменту:

| Фаза | Проверка / действие | checkout | `.env` | контейнер |
| --- | --- | --- | --- | --- |
| 0 | изменённые **отслеживаемые** файлы (staged или нет) — отказ с перечнем путей; неотслеживаемые/игнорируемые (`.env`, логи) допустимы. Запущенная версия (метка образа контейнера) выше `X.Y.Z` — отказ (без отката) | нет | нет | нет |
| 1 | `docker login`, `docker pull X.Y.Z`, сверка digest | нет | нет | нет |
| 2 | `git checkout master`, fast-forward ровно на SHA, проверка SHA; Compose должен разрешать образ ровно в `<DOCKERHUB_USERNAME>/ok-service-frontend:X.Y.Z` | **может** | нет | нет |
| 3 | `.env` атомарно: `TAG=X.Y.Z`, `DOCKERHUB_USERNAME`, `PREV_TAG`, `PREV_IMAGE` (полная ссылка образа, который работал до деплоя). Повтор той же версии сохраняет `PREV_TAG`/`PREV_IMAGE` | да | **да** | нет |
| 4 | `docker compose up -d --no-deps frontend` (без `compose down`); контейнер должен быть из этого образа (по image ID) и стать `healthy` по `HEALTHCHECK` Dockerfile (до 180 с, `HEALTH_TIMEOUT`) | да | да | **заменён** |

   При ошибке лог печатает `Deploy stopped: …` с тем, что уже могло измениться, и (с фазы 3) значения `PREV_IMAGE`/`PREV_TAG`.
4. **release** (`contents: write` только здесь) повторяет `plan` (`resume` или `released`, та же версия и digest). Если GitHub Release уже есть — успех без проверки сервера и без деплоя. Иначе `deploy-production.sh verify` проверяет живой контейнер (образ `X.Y.Z` с этим digest, `healthy`), затем создаётся аннотированный тег `vX.Y.Z` (если его нет) и GitHub Release. Существующий тег не двигается; старая версия ради публикации заметок не передеплоивается.
5. **notify**: Telegram, Jira и OpenProject различают итоги: деплой не требуется (Jira/OpenProject не комментируются), деплой не удался, деплой выполнен но релиз не опубликован, релиз выпущен.

Доказательство деплоя — **образ и health запущенного контейнера**, а не `TAG` в `.env`: `.env` меняется в фазе 3, до запуска контейнера.

## Docker Hub репозиторий

CI публикует в `${DOCKERHUB_USERNAME}/ok-service-frontend` (секрет). `docker-compose.yml` использует `${DOCKERHUB_USERNAME:-gloomylime}/ok-service-frontend:${TAG}`: деплой записывает `DOCKERHUB_USERNAME` в `.env`, а старые `.env` без этого ключа продолжают работать с прежним `gloomylime`.

## Повторы и восстановление

Что работает на production, смотрите так (на сервере, в `apps/ok-service-frontend`):

```sh
docker inspect --format '{{.Config.Image}} {{index .Config.Labels "org.opencontainers.image.version"}} {{.State.Health.Status}}' "$(docker compose ps -q frontend)"
```

| Ситуация | Что делать |
| --- | --- |
| Упал build/push/promote | Production не менялся. Re-run всего запуска: `plan` вернёт `resume`, если `X.Y.Z` уже назначен, иначе `new`. |
| Упал deploy в фазах 0–1 | Ничего не менялось. Устраните причину (например, отслеживаемые правки на сервере — пути в логе), Re-run failed jobs. |
| Упал deploy в фазе 2 | Сервис и `.env` не менялись, checkout мог продвинуться. Re-run failed jobs. |
| Упал deploy в фазах 3–4 (unhealthy, таймаут) | Лог печатает `PREV_IMAGE`. Восстановление: в `.env` выставить `DOCKERHUB_USERNAME` и `TAG` из `PREV_IMAGE` (`<namespace>/ok-service-frontend:<tag>`), затем `docker compose up -d frontend`. Затем `fix:` или Re-run (`resume`). |
| Деплой проверен, упал release | Re-run failed jobs: release перепроверит владение и живой контейнер и допубликует тег/Release. |
| Тег есть, Release нет | Re-run: Release создаётся только если на сервере работает `healthy` контейнер этого digest. Иначе публикация блокируется — сначала разберитесь, что работает на production. |
| Тег и Release есть | Re-run успешно завершается без деплоя. |

### Promoted release overtaken by master

Запуск A назначил своему кандидату `1.0.0`, но до деплоя в `master` пришёл коммит B (тега `v1.0.0` ещё нет). Запуск B падает с «`…:1.0.0` exists for commit <A> … Finish that release first».

1. Если запуск A ещё идёт — дождитесь его: он задеплоит и опубликует `1.0.0` (владение доказано, хотя `master` уже на B).
2. Если A упал или остановился сразу после promote — **Re-run all jobs** в запуске A (даже если build-job не оставил outputs): `plan` вернёт `resume 1.0.0`, затем deploy и release.
3. Затем **Re-run all jobs** в запуске B: он выберет `1.0.1`.

A не доводит релиз, если `prod-<A>` и `1.0.0` расходятся по digest, A не в истории `origin/master`, уже есть тег выше `v1.0.0` или на сервере работает более новая версия — тогда запуск падает. Тег `X.Y.Z` в Docker Hub неизменяем и при восстановлении не удаляется.

## Первый релиз

Тегов нет → первый успешный production-запуск выпускает `1.0.0` на развёрнутый коммит с пометкой «Initial production release». Заранее ничего не тегируйте. До первого запуска убедитесь, что checkout `apps/ok-service-frontend` на сервере чистый и на ветке `master`.
