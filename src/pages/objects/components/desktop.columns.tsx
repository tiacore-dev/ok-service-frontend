import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";
import { IUser } from "../../../interfaces/users/IUser";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { ICity } from "../../../interfaces/cities/ICity";

export const objectsDesktopColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>,
  usersMap: Record<string, IUser>,
  citiesMap: Record<string, ICity>,
  statusOptions?: { text: string; value: string }[]
): ColumnsType<IObjectsListColumn> => [
  {
    title: "Имя",
    dataIndex: "name",
    key: "name",
    width: "15%",
    filterDropdown: filterDropdown,
    onFilter: (value, record) =>
      record.name
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()),
    sorter: (a, b) => (a.name > b.name ? 1 : -1),
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
    width: "15%",
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
    width: "15%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{record.description}</div>
      </div>
    ),
  },
  {
    title: "Город",
    dataIndex: "city",
    key: "city",
    width: "10%",
    filterDropdown: filterDropdown,
    onFilter: (value, record) =>
      record.city
        ? citiesMap[record.city]?.name
            .toString()
            .toLowerCase()
            .includes(value.toString().toLowerCase())
        : false,
    sorter: (a, b) => {
      const cityA = a.city ? citiesMap[a.city]?.name || "" : "";
      const cityB = b.city ? citiesMap[b.city]?.name || "" : "";
      return cityA > cityB ? 1 : -1;
    },
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{record.city ? citiesMap[record.city]?.name : "—"}</div>
      </div>
    ),
  },
  {
    title: "Менеджер",
    dataIndex: "manager",
    key: "manager",
    width: "15%",
    filterDropdown: filterDropdown,
    onFilter: (value, record) =>
      usersMap[record.manager]?.name
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()),
    sorter: (a, b) =>
      usersMap[a.manager]?.name > usersMap[b.manager]?.name ? 1 : -1,
    render: (text: string, record: IObjectsListColumn) => (
      <div>
        <div>{usersMap[record.manager]?.name}</div>
      </div>
    ),
  },
  {
    title: "Статус",
    dataIndex: "status",
    filters: statusOptions,
    onFilter: (value, record) => record.status.includes(value as string),
    sorter: (a, b) =>
      statusMap[a.status]?.name > statusMap[b.status]?.name ? 1 : -1,
    key: "status",
    width: "15%",
    render: (text: string, record: IObjectsListColumn) => (
      <div>{statusMap[record.status]?.name}</div>
    ),
  },
];
