import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUsersListColumn } from "../../../interfaces/users/IUsersList";
import { IRole } from "../../../interfaces/roles/IRole";

export const usersDesktopColumns = (
  navigate: NavigateFunction,
  rolesMap: Record<string, IRole>
): ColumnsType<IUsersListColumn> => [
  {
    title: "Имя",
    dataIndex: "name",
    key: "name",
    width: "25%",

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
    width: "25%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{record.login}</div>
    ),
  },
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "25%",
    render: (text: string, record: IUsersListColumn) => (
      <div>{record.user_id}</div>
    ),
  },
  {
    title: "Роль",
    dataIndex: "role",
    key: "role",
    width: "25%",
    render: (text: string, record: IUsersListColumn) => (
      <div>
        <div>{rolesMap[record.role]?.name}</div>
      </div>
    ),
  },
];
