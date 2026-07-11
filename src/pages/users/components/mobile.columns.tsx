import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUsersListColumn } from "../../../interfaces/users/IUsersList";
import { IRole } from "../../../interfaces/roles/IRole";
import { ICity } from "../../../interfaces/cities/ICity";
import { IPosition } from "../../../interfaces/positions/IPosition";

export const usersMobileColumns = (
  navigate: NavigateFunction,
  rolesMap: Record<string, IRole>,
  citiesMap: Record<string, ICity>,
  positionsMap: Record<string, IPosition>,
): ColumnsType<IUsersListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: IUsersListColumn) => (
      <div>
        <a
          className="users__table__number"
          onClick={() => navigate && navigate(`/users/${record.key}`)}
        >
          {record.name}
        </a>
        <div>Разряд: {record.category?.toString()}</div>
        <div>Логин: {record.login}</div>
        <div>Город: {record.city ? citiesMap[record.city]?.name : "—"}</div>
        <div>Роль: {rolesMap[record.role]?.name}</div>
        <div>
          Должность:{" "}
          {record.position ? positionsMap[record.position]?.name ?? "—" : "—"}
        </div>
        <div>Активен: {record.is_active ? "Да" : "Нет"}</div>
      </div>
    ),
  },
];
