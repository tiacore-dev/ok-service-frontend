import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUser } from "../../../../interfaces/users/IUser";
import { IProjectsListColumn } from "../../../../interfaces/projects/IProjectsList";
import { IProjectStatus } from "../../../../interfaces/projects/IProjectStatus";

export const projectsMobileColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
  projectStatuses: IProjectStatus[],
): ColumnsType<IProjectsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>
        <a
          className="projects__table__number"
          onClick={() => navigate && navigate(`/projects/${record.key}`)}
        >
          {record.name}
        </a>
        <div>Прораб: {usersMap[record.project_leader]?.name}</div>
        <div>
          Статус:{" "}
          {projectStatuses.find((item) => item.value === record.status)
            ?.label ??
            record.status ??
            "—"}
        </div>
      </div>
    ),
  },
];
