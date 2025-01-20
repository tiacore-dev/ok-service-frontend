import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";
import { IObject } from "../../../interfaces/objects/IObject";
import { IUser } from "../../../interfaces/users/IUser";

export const projectsMobileColumns = (
  navigate: NavigateFunction,
  objectsMap: Record<string, IObject>,
  usersMap: Record<string, IUser>
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
        <div>id: {record.project_id}</div>
        <div>Объект: {objectsMap[record.object]?.name}</div>
        <div>Прораб: {usersMap[record.project_leader]?.name}</div>
      </div>
    ),
  },
];
