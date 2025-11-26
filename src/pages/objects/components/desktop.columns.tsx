import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import type { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";
import type { IUser } from "../../../interfaces/users/IUser";
import type { ICity } from "../../../interfaces/cities/ICity";

export const objectsDesktopColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>,
  usersMap: Record<string, IUser>,
  citiesMap: Record<string, ICity>,
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
    render: (text: string, record: IObjectsListColumn) => <div>{record.address}</div>,
  },
  {
    title: "Описание",
    dataIndex: "description",
    key: "description",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => <div>{record.description}</div>,
  },
  {
    title: "Город",
    dataIndex: "city",
    key: "city",
    width: "10%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>{record.city ? citiesMap[record.city]?.name : "-"}</div>
    ),
  },
  {
    title: "Прораб",
    dataIndex: "manager",
    key: "manager",
    width: "20%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>{usersMap[record.manager]?.name}</div>
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
