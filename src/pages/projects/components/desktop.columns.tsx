import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";
import { IObject } from "../../../interfaces/objects/IObject";
import { IUser } from "../../../interfaces/users/IUser";

export const projectsDesktopColumns = (
  navigate: NavigateFunction,
  objectsMap: Record<string, IObject>,
  usersMap: Record<string, IUser>
): ColumnsType<IProjectsListColumn> => [
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      width: "20%",

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
      title: "Объект",
      dataIndex: "object",
      key: "object",
      width: "20%",
      render: (text: string, record: IProjectsListColumn) => (
        <div>
          <div>{objectsMap[record.object]?.name}</div>
        </div>
      ),
    },
    {
      title: "Прораб",
      dataIndex: "project_leader",
      key: "project_leader",
      width: "20%",
      render: (text: string, record: IProjectsListColumn) => (
        <div>
          <div>{usersMap[record.project_leader]?.name}</div>
        </div>
      ),
    },
  ];
