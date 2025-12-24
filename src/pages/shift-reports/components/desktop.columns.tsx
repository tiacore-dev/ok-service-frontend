import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import type { IUser } from "../../../interfaces/users/IUser";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { Checkbox } from "antd";
import type { IProject } from "../../../interfaces/projects/IProject";
import type { IObject } from "../../../interfaces/objects/IObject";
import type { SorterResult } from "antd/es/table/interface";

export const shiftReportsDesktopColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>,
  objectsMap: Record<string, IObject>,
  sorter?: SorterResult<IShiftReportsListColumn>,
): ColumnsType<IShiftReportsListColumn> =>
  [
    {
      title: "Номер",
      dataIndex: "number",
      key: "number",
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <a
            className="shift-reports__table__number"
            onClick={() => navigate && navigate(`/shifts/${record.key}`)}
          >
            {record.number?.toString().padStart(5, "0")}
          </a>
        </div>
      ),
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      sorter: true,
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{dateTimestampToLocalString(record.date)}</div>
      ),
    },
    {
      title: "Исполнитель",
      dataIndex: "user",
      key: "user",
      sorter: true,
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{usersMap[record.user]?.name}</div>
      ),
    },
    {
      title: "Объект",
      dataIndex: "object",
      key: "object",
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{objectsMap[projectMap[record.project]?.object]?.name}</div>
      ),
    },
    {
      title: "Спецификация",
      dataIndex: "project",
      key: "project",
      sorter: true,
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{projectMap[record.project]?.name}</div>
      ),
    },
    {
      title: "Прораб",
      dataIndex: "project_leader",
      key: "project_leader",
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{usersMap[projectMap[record.project]?.project_leader]?.name}</div>
      ),
    },
    {
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>{record.shift_report_details_sum}</div>
      ),
    },
    {
      title: "Подписан",
      dataIndex: "signed",
      key: "signed",
      sorter: true,
      render: (_text: string, record: IShiftReportsListColumn) => (
        <div>
          <Checkbox checked={!!record.signed} disabled />
        </div>
      ),
    },
  ].map((column) => ({
    ...column,
    sortOrder:
      column.sorter && sorter?.field === column.key ? sorter.order : null,
  }));
