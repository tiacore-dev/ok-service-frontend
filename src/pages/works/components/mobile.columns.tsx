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
        {role === RoleId.USER ? (
          <div>{record.name}</div>
        ) : (
          <a
            className="works__table__number"
            onClick={() => navigate && navigate(`/works/${record.key}`)}
          >
            {record.name}
          </a>
        )}
        <div>Категория: {record.category.name}</div>
        <div>Единицы измерения: {record.measurement_unit}</div>
        <div>
          Разряд 1:{" "}
          {record.work_prices?.find((price) => price.category === 1)?.price ||
            "-"}
        </div>
        <div>
          Разряд 2:{" "}
          {record.work_prices?.find((price) => price.category === 2)?.price ||
            "-"}
        </div>
        <div>
          Разряд 3:{" "}
          {record.work_prices?.find((price) => price.category === 3)?.price ||
            "-"}
        </div>
        <div>
          Разряд 4:{" "}
          {record.work_prices?.find((price) => price.category === 4)?.price ||
            "-"}
        </div>
      </div>
    ),
  },
];
