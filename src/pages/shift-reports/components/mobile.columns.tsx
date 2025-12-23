import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IUser } from "../../../interfaces/users/IUser";
import {
  dateTimestampToLocalDateTimeString,
  dateTimestampToLocalString,
} from "../../../utils/dateConverter";
import { IProject } from "../../../interfaces/projects/IProject";
import { RoleId } from "../../../interfaces/roles/IRole";

export const shiftReportsMobileColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>,
  currentRole?: RoleId,
): ColumnsType<IShiftReportsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IShiftReportsListColumn) => (
      <div>
        <a
          className="shift-reports__table__number"
          onClick={() => navigate && navigate(`/shifts/${record.key}`)}
        >
          {`${usersMap[record.user]?.name} ${dateTimestampToLocalString(record.date)}`}
        </a>
        <div>Спецификация: {projectMap[record.project]?.name}</div>
        <div>
          Прораб: {usersMap[projectMap[record.project]?.project_leader]?.name}
        </div>
        {currentRole === RoleId.ADMIN && (
          <>
            <div>
              Начало:{" "}
              {record.date_start
                ? dateTimestampToLocalDateTimeString(record.date_start)
                : "-"}
            </div>
            <div>
              Расстояние начала:{" "}
              {typeof record.distance_start === "number"
                ? `${record.distance_start} м`
                : "-"}
            </div>
            <div>
              Окончание:{" "}
              {record.date_end
                ? dateTimestampToLocalDateTimeString(record.date_end)
                : "-"}
            </div>
            <div>
              Расстояние окончания:{" "}
              {typeof record.distance_end === "number"
                ? `${record.distance_end} м`
                : "-"}
            </div>
          </>
        )}
      </div>
    ),
  },
];
