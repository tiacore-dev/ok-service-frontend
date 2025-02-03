import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IUser } from "../../../interfaces/users/IUser";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { IProject } from "../../../interfaces/projects/IProject";

export const shiftReportsMobileColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>
): ColumnsType<IShiftReportsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <a
          className="shift-reports__table__number"
          onClick={() => navigate && navigate(`/shiftReports/${record.key}`)}
        >
          {`${usersMap[record.user]?.name} ${dateTimestampToLocalString(record.date)}`}
        </a>
        <div>id: {record.shift_report_id}</div>
        <div>Спецификация: {projectMap[record.project]?.name}</div>
        <div>
          Прораб: {usersMap[projectMap[record.project]?.project_leader]?.name}
        </div>
      </div>
    ),
  },
];
