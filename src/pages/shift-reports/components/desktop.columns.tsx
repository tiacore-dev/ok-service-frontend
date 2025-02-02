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
    title: "Исполнитель",
    dataIndex: "user",
    key: "user",
    width: "20%",

    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <a
          className="shift-reports__table__number"
          onClick={() => navigate && navigate(`/shiftReports/${record.key}`)}
        >
          {`${usersMap[record.user]?.name} ${dateTimestampToLocalString(record.date)}`}
        </a>
      </div>
    ),
  },
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "20%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>{record.shift_report_id}</div>
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
        <div>{usersMap[record.project_leader]?.name}</div>
      </div>
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
