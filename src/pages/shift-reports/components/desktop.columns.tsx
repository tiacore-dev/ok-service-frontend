import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IUser } from "../../../interfaces/users/IUser";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { Checkbox } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";

export const shiftReportsDesktopColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>
): ColumnsType<IShiftReportsListColumn> => [
  {
    title: "Номер",
    dataIndex: "number",
    key: "number",
    width: "20%",

    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <a
          className="shift-reports__table__number"
          onClick={() => navigate && navigate(`/shifts/${record.key}`)}
        >
          {`${record.number?.toString().padStart(5, "0")} от ${dateTimestampToLocalString(record.date)}`}
        </a>
      </div>
    ),
  },
  {
    title: "Исполнитель",
    dataIndex: "user",
    key: "user",
    width: "20%",

    render: (text: string, record: IShiftReportsListColumn) => (
      <div>{usersMap[record.user]?.name}</div>
    ),
  },
  {
    title: "Спецификация",
    dataIndex: "project",
    key: "project",
    width: "20%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <div>{projectMap[record.project]?.name}</div>
      </div>
    ),
  },
  {
    title: "Прораб",
    dataIndex: "project_leader",
    key: "project_leader",
    width: "20%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <div>{usersMap[projectMap[record.project]?.project_leader]?.name}</div>
      </div>
    ),
  },
  {
    title: "Сумма",
    dataIndex: "summ",
    key: "summ",
    width: "20%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>{record.shift_report_details_sum}</div>
    ),
  },
  {
    title: "Согласовано",
    dataIndex: "signed",
    key: "signed",
    width: "20%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <Checkbox checked={!!record.signed} />
      </div>
    ),
  },
];
