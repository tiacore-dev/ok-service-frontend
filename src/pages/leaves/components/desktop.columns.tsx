import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUser } from "../../../interfaces/users/IUser";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { ILeaveListColumn } from "../../../interfaces/leaves/ILeaveList";
import { ILeavesSettingsState } from "../../../store/modules/settings/leaves";
import {
  leaveReasonesMap,
  leaveReasonOptions,
} from "../../../queries/leaveReasons";

export const leavesDesktopColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
  tableState?: ILeavesSettingsState,
): ColumnsType<ILeaveListColumn> => {
  const columns: ColumnsType<ILeaveListColumn> = [
    {
      title: "Причина",
      dataIndex: "reason",
      filters: leaveReasonOptions,
      onFilter: (value, record) => record.reason.includes(value as string),
      sorter: (a, b) =>
        leaveReasonesMap[a.reason]?.name > leaveReasonesMap[b.reason]?.name
          ? 1
          : -1,
      key: "status",
      width: "20%",
      render: (text: string, record: ILeaveListColumn) => (
        <div onClick={() => navigate && navigate(`/leaves/${record.key}`)}>
          {leaveReasonesMap[record.reason]?.name}
        </div>
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      width: "20%",
      render: (text: string, record: ILeaveListColumn) => (
        <div>
          <div>{record.comment}</div>
        </div>
      ),
    },
    {
      title: "Сотрудник",
      dataIndex: "manager",
      key: "manager",
      width: "20%",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        usersMap[record.user]?.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        usersMap[a.user]?.name > usersMap[b.user]?.name ? 1 : -1,
      render: (text: string, record: ILeaveListColumn) => (
        <div>
          <div>{usersMap[record.user]?.name}</div>
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
