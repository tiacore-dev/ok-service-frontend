import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { RoleId } from "../../../interfaces/roles/IRole";
const renderPrice = (record: IWorksListColumn, category: number) => {
  const price = record.work_prices?.find((p) => p.category === category)?.price;
  return price ? `${price} руб.` : "-";
};
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>Разряд 1: {renderPrice(record, 1)}</div>
          <div>Разряд 2: {renderPrice(record, 2)}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>Разряд 3: {renderPrice(record, 3)}</div>
          <div>Разряд 4: {renderPrice(record, 4)}</div>
        </div>
      </div>
    ),
  },
];
