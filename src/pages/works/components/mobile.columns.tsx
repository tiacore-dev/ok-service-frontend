import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { IRole } from "../../../interfaces/roles/IRole";

export const worksMobileColumns = (
  navigate: NavigateFunction
): ColumnsType<IWorksListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IWorksListColumn) => (
      <div>
        <a
          className="works__table__number"
          onClick={() => navigate && navigate(`/works/${record.key}`)}
        >
          {record.name}
        </a>
        <div>id: {record.work_id}</div>
        <div>Категория: {record.category}</div>
        <div>Единицы измерения: {record.measurement_unit}</div>
      </div>
    ),
  },
];
