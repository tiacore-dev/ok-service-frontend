import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";
import { IUser } from "../../../interfaces/users/IUser";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import type { IObjectsSettingsState } from "../../../store/modules/settings/objects";

export const objectsDesktopColumns = (
  navigate: NavigateFunction,
  statusMap: Record<string, IObjectStatus>,
  usersMap: Record<string, IUser>,
  statusOptions?: { text: string; value: string }[],
  tableState?: IObjectsSettingsState
): ColumnsType<IObjectsListColumn> => {
  const columns: ColumnsType<IObjectsListColumn> = [
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
      width: "20%",
      render: (text: string, record: IObjectsListColumn) => (
        <div>{statusMap[record.status]?.name}</div>
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
