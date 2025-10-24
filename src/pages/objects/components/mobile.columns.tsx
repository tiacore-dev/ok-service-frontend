import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";
import { ICity } from "../../../interfaces/cities/ICity";

export const objectsMobileColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>,
  citiesMap: Record<string, ICity>
): ColumnsType<IObjectsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <a
          className="objects__table__number"
          onClick={() => navigate && navigate(`/objects/${record.key}`)}
        >
          {record.name}
        </a>
        <div>Адрес: {record.address}</div>
        <div>Описание: {record.description}</div>
        <div>Город: {record.city ? citiesMap[record.city]?.name : "—"}</div>
        <div>Статус: {statusMap[record.status]?.name}</div>
      </div>
    ),
  },
];
