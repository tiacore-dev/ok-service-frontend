import React from "react";
import { Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IPositionsListColumn } from "../../../interfaces/positions/IPositionsList";
import type { IUser } from "../../../interfaces/users/IUser";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { EditablePositionDialog } from "../../../components/ActionDialogs/EditablePositionDialog/EditablePositionDialog";
import { DeletePositionDialog } from "../../../components/ActionDialogs/DeletePositionDialog";

export const positionsDesktopColumns = (
  usersMap: Record<string, IUser>,
  onDelete: (positionId: string) => void,
  canManage: boolean,
): ColumnsType<IPositionsListColumn> => {
  const columns: ColumnsType<IPositionsListColumn> = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      width: "50%",
      filterDropdown,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Создатель",
      dataIndex: "created_by",
      key: "created_by",
      width: "35%",
      render: (_, record) => (
        <div>{usersMap[record.created_by ?? ""]?.name ?? "—"}</div>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      title: "",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <EditablePositionDialog position={record} iconOnly />
          <DeletePositionDialog
            name={record.name}
            onDelete={() => onDelete(record.position_id)}
          />
        </Space>
      ),
    });
  }

  return columns;
};
