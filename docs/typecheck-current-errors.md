# Справочник текущих строгих TypeScript-ошибок

Срез создан: 07.09.2026.

Проверка выполнена без изменения `tsconfig.json` командой:

```bash
npx tsc --noEmit --skipLibCheck --strict
```

Обычная проверка проекта не показывает эти ошибки, потому что в `tsconfig.json`
не включён `strict`. Этот файл — рабочий реестр для постепенного исправления;
строгий режим в конфигурацию проекта пока не добавляем.

## Сводка исходного среза

Всего: **141** ошибка.

| Код     | Количество | Смысл                             |
| ------- | ---------: | --------------------------------- |
| TS2322  |         92 | Несовместимое присваивание типов  |
| TS2345  |         28 | Неподходящий аргумент функции     |
| TS18048 |         10 | Значение может быть `undefined`   |
| TS2538  |          4 | `undefined` используется как ключ |
| TS2339  |          3 | Свойство отсутствует в типе       |
| TS18047 |          2 | Значение может быть `null`        |
| TS2488  |          1 | Нельзя итерировать значение       |
| TS2722  |          1 | Возможно вызывается `undefined`   |

## Уже исправлено

Без изменения бизнес-логики исправлено 30 ошибок. После пятой пачки осталось
**111** строгих диагностик.

- `src/api/base.ts`: очередь ожидания refresh-токена действительно завершается
  без значения, поэтому promise и `resolve` приведены к `void`.
- семь диалогов удаления: `popoverText` больше не передаёт `false`; вместо него
  передаётся строка или `undefined`. Визуальное поведение не меняется.
- шесть диалогов создания и редактирования: исправлена та же передача `false`
  в необязательный текст подсказки.
- два табличных фильтра: обработчик даты учитывает контракт Ant Design, а
  необязательный `clearFilters` вызывается безопасно.
- пять списков: для строк без идентификатора добавлен только локальный fallback
  ключа React. При корректном ответе API поведение не меняется.
- семь таблиц: на мобильном ширина колонки теперь передаётся как `undefined`,
  а не как булево `false`.
- два графика главной страницы: `ref` контейнера получил корректный тип DOM-
  элемента, поэтому TypeScript видит `offsetWidth`.

## Распределение оставшихся ошибок по файлам

| Файл                                                                               | Ошибок в исходном срезе |
| ---------------------------------------------------------------------------------- | ----------------------: |
| `components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog.tsx` |                      10 |
| `pages/project/project.tsx`                                                        |                       8 |
| `pages/shiftReports/components/actions.tsx`                                        |                       7 |
| `pages/assignment/assignment.tsx`                                                  |                       6 |
| `pages/shiftReport/shiftReport.tsx`                                                |                       6 |
| `pages/shiftReports/components/export/useDownloadObjectVolumeReport.tsx`           |                       6 |
| `store/modules/auth.ts`                                                            |                       6 |
| `components/ActionDialogs/EditableWorkDialog/EditableWorkDialog.tsx`               |                       5 |
| `pages/shiftReports/components/export/useDownloadUsersReport.tsx`                  |                       5 |
| `store/modules/editableEntities/editableObject.ts`                                 |                       5 |
| `pages/components/WorkMaterialRelationsTable.tsx`                                  |                       4 |
| `pages/shiftReports/ShiftReportsFilters.tsx`                                       |                       4 |
| `store/modules/editableEntities/editableUser.ts`                                   |                       4 |
| `components/ActionDialogs/EditableLeaveDialog/EditableLeaveDialog.tsx`             |                       3 |
| `pages/project/ImportProjectWorks.tsx`                                             |                       3 |
| `pages/work-categories/work-categories.page.tsx`                                   |                       3 |
| `pages/work/work.tsx`                                                              |                       3 |
| `store/modules/editableEntities/editableProject.ts`                                |                       3 |
| `components/ActionDialogs/EditableMaterialDialog/EditableMaterialDialog.tsx`       |                       2 |
| `hooks/useAuth.ts`                                                                 |                       2 |
| `pages/main/main.tsx`                                                              |                       2 |
| `pages/main/utils/reduceShiftReportData.ts`                                        |                       2 |
| `pages/material/material.tsx`                                                      |                       2 |
| `pages/project/EditableProjectWorkDialog.tsx`                                      |                       2 |
| `pages/project/ProjectMaterialsTable.tsx`                                          |                       2 |
| `pages/shiftReport/downloadShiftReport.tsx`                                        |                       2 |
| `pages/shiftReport/ShiftReportMaterialsTable.tsx`                                  |                       2 |
| `pages/shiftReports/shiftReports.page.tsx`                                         |                       2 |
| `pages/works/works.page.tsx`                                                       |                       2 |
| `api/base.ts` и каждый из 27 остальных файлов                                      |                       1 |

## Приоритет исправления

1. **Безопасные локальные типы**: `false` вместо `undefined`, необязательные
   callback'и, типы ссылок/ключей таблиц. Исправлять первыми.
2. **Формы и диалоги**: поля могут быть `null`/`undefined`; перед изменением
   нужно проверить значение по умолчанию и сценарий сохранения.
3. **Отчёты смен, импорт и Redux**: затрагивают расчёты и данные; исправлять
   только после отдельной проверки бизнес-сценариев.

На текущем срезе все оставшиеся ошибки относятся к пунктам 2–3: nullable-поля
форм, данные отчётов, авторизация, импорт или Redux. Они требуют проверки
конкретных сценариев и не включаются в безопасные массовые правки.

После каждой серии правок запускать ту же команду и обновлять этот реестр.
