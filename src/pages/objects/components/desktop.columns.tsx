import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";
import { IUser } from "../../../interfaces/users/IUser";

export const objectsDesktopColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>,
  usersMap: Record<string, IUser>
): ColumnsType<IObjectsListColumn> => [
  {
    title: "Имя",
    dataIndex: "name",
    key: "name",
    width: "20%",

    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <a
          className="objects__table__number"
          onClick={() => navigate && navigate(`/objects/${record.key}`)}
        >
          {record.name}
        </a>
      </div>
    ),
  },
  {
    title: "Адрес",
    dataIndex: "address",
    key: "address",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{record.address}</div>
      </div>
    ),
  },
  {
    title: "Описание",
    dataIndex: "description",
    key: "description",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{record.description}</div>
      </div>
    ),
  },
  {
    title: "Менеджер",
    dataIndex: "manager",
    key: "manager",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{usersMap[record.manager]?.name}</div>
      </div>
    ),
  },
  {
    title: "Статус",
    dataIndex: "status",
    key: "status",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>{statusMap[record.status]?.name}</div>
    ),
  },
];
