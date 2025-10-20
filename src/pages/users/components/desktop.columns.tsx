import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUsersListColumn } from "../../../interfaces/users/IUsersList";
import { IRole } from "../../../interfaces/roles/IRole";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { categoryFilterOptions } from "../../../utils/categoryMap";
import type { IUsersSettingsState } from "../../../store/modules/settings/users";

export const usersDesktopColumns = (
  navigate: NavigateFunction,
  rolesMap: Record<string, IRole>,
  rolesOptions?: { text: string; value: string }[],
  tableState?: IUsersSettingsState
): ColumnsType<IUsersListColumn> => {
  const columns: ColumnsType<IUsersListColumn> = [
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      width: "20%",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
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
      title: "Разряд",
      dataIndex: "category",
      key: "category",
      width: "20%",
      filters: categoryFilterOptions,
      onFilter: (value, record) => record.category === value,
      sorter: (a, b) => a.category - b.category,
      render: (text: string, record: IUsersListColumn) => (
        <div>{record.category ?? "Нет разряда"}</div>
      ),
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      width: "20%",
      filters: rolesOptions,
      onFilter: (value, record) => record.role.includes(value as string),
      sorter: (a, b) =>
        rolesMap[a.role]?.name > rolesMap[b.role]?.name ? 1 : -1,
      render: (text: string, record: IUsersListColumn) => (
        <div>
          <div>{rolesMap[record.role]?.name}</div>
        </div>
      ),
    },
  ];

  return columns.map((column) => {
    if ("children" in column) {
      return column;
    }

    const columnKey =
      typeof column.key === "string"
        ? column.key
        : "dataIndex" in column && typeof column.dataIndex === "string"
          ? column.dataIndex
          : undefined;

    return {
      ...column,
      filteredValue:
        columnKey && tableState?.filters
          ? tableState.filters[columnKey] ?? null
          : column.filteredValue ?? null,
      sortOrder:
        columnKey &&
        (tableState?.sorter?.field === columnKey ||
          tableState?.sorter?.columnKey === columnKey)
          ? tableState?.sorter?.order ?? null
          : column.sortOrder ?? null,
    };
  });
};
