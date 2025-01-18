import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";

export const projectsDesktopColumns = (
  navigate: NavigateFunction
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
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "20%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>{record.project_id}</div>
    ),
  },
  {
    title: "Объект",
    dataIndex: "object",
    key: "object",
    width: "20%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>
        <div>{record.object}</div>
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
        <div>{record.project_leader}</div>
      </div>
    ),
  },
];
