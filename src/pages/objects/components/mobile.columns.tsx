import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectListColumn } from "../../../interfaces/objects/IObjectList";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";

export const objectsMobileColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>
): ColumnsType<IObjectListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IObjectListColumn) => (
      <div>
        <a
          className="objects__table__number"
          onClick={() => navigate && navigate(`/objects/${record.key}`)}
        >
          {record.name}
        </a>
        <div>id: {record.object_id}</div>
        <div>Адрес: {record.address}</div>
        <div>Описание: {record.description}</div>
        <div>Статус: {statusMap[record.status]?.name}</div>
      </div>
    ),
  },
];
