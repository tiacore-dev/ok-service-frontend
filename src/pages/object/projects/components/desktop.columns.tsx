import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IProjectsListColumn } from "../../../../interfaces/projects/IProjectsList";
import type { IUser } from "../../../../interfaces/users/IUser";

export const projectsDesktopColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
): ColumnsType<IProjectsListColumn> => [
  {
    title: "Спецификация",
    dataIndex: "name",
    key: "name",
    width: "50%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>
        <a
          className="projects__table__number"
          onClick={() => navigate && navigate(`/projects/${record.key}`)}
        >
          {record.name}
        </a>
      </div>
    ),
  },
  {
    title: "Прораб",
    dataIndex: "project_leader",
    key: "project_leader",
    width: "50%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>{usersMap[record.project_leader]?.name}</div>
    ),
  },
];
