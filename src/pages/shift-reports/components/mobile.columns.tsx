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

const formatDistance = (meters?: number | null) =>
  meters ? ` (${meters} м)` : null;

export const shiftReportsMobileColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>,
): ColumnsType<IShiftReportsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (_: string, record: IShiftReportsListColumn) => {
      const userName = usersMap[record.user]?.name ?? "";
      const project = projectMap[record.project];
      const projectName = project?.name ?? "";
      const leaderName = project?.project_leader
        ? usersMap[project.project_leader]?.name ?? ""
        : "";

      return (
        <div>
          <a
            className="shift-reports__table__number"
            onClick={() => navigate(`/shifts/${record.key}`)}
          >
            {userName} {dateTimestampToLocalString(record.date)}
          </a>

          <div>Спецификация: {projectName}</div>
          <div>Прораб: {leaderName}</div>

          <div>
            {`Начало: ${
              record.date_start
                ? dateTimestampToLocalDateTimeString(record.date_start)
                : "-"
            }`}
            {formatDistance(record.distance_start)}
          </div>

          <div>
            {`Окончание: ${
              record.date_end
                ? dateTimestampToLocalDateTimeString(record.date_end)
                : "-"
            }`}
            {formatDistance(record.distance_end)}
          </div>
        </div>
      );
    },
  },
];
