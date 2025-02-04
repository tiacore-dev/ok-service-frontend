import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { RoleId } from "../../../interfaces/roles/IRole";

export const worksMobileColumns = (
  navigate: NavigateFunction,
  role: RoleId
): ColumnsType<IWorksListColumn> => [
    {
      dataIndex: "mobileData",
      key: "mobileData",
      width: "100%",
      render: (text: string, record: IWorksListColumn) => (
        <div>
          {role === RoleId.USER ? <div>{record.name}</div> :
            <a
              className="works__table__number"
              onClick={() => navigate && navigate(`/works/${record.key}`)}
            >
              {record.name}
            </a>}
          <div>Категория: {record.category.name}</div>
          <div>Единицы измерения: {record.measurement_unit}</div>
        </div>
      ),
    },
  ];
