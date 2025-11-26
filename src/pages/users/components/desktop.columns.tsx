import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IUsersListColumn } from "../../../interfaces/users/IUsersList";
import type { IRole } from "../../../interfaces/roles/IRole";
import type { ICity } from "../../../interfaces/cities/ICity";

export const usersDesktopColumns = (
  navigate: NavigateFunction,
  rolesMap: Record<string, IRole>,
  citiesMap: Record<string, ICity>,
): ColumnsType<IUsersListColumn> => [
  {
    title: "Имя",
    dataIndex: "name",
    key: "name",
    width: "20%",
    render: (text: string, record: IUsersListColumn) => (
      <div>
        <a
          className="users__table__number"
          onClick={() => navigate && navigate(`/users/${record.key}`)}
        >
          {record.name}
        </a>
      </div>
    ),
  },
  {
    title: "Логин",
    dataIndex: "login",
    key: "login",
    width: "20%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{record.login}</div>
    ),
  },
  {
    title: "Категория",
    dataIndex: "category",
    key: "category",
    width: "20%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{record.category ?? "Не назначена"}</div>
    ),
  },
  {
    title: "Роль",
    dataIndex: "role",
    key: "role",
    width: "20%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{rolesMap[record.role]?.name}</div>
    ),
  },
  {
    title: "Город",
    dataIndex: "city",
    key: "city",
    width: "15%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{record.city ? citiesMap[record.city]?.name : "-"}</div>
    ),
  },
];
