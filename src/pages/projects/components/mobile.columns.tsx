import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";

export const projectsMobileColumns = (
  navigate: NavigateFunction
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
        <div>Объект: {record.object}</div>
        <div>Прораб: {record.project_leader}</div>
      </div>
    ),
  },
];
