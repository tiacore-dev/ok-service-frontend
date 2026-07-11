import React from "react";
import { Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IPositionsListColumn } from "../../../interfaces/positions/IPositionsList";
import type { IUser } from "../../../interfaces/users/IUser";
import { EditablePositionDialog } from "../../../components/ActionDialogs/EditablePositionDialog/EditablePositionDialog";
import { DeletePositionDialog } from "../../../components/ActionDialogs/DeletePositionDialog";

export const positionsMobileColumns = (
  usersMap: Record<string, IUser>,
  onDelete: (positionId: string) => void,
  canManage: boolean,
): ColumnsType<IPositionsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (_, record) => (
      <div>
        <div>{record.name}</div>
        <div>Создатель: {usersMap[record.created_by ?? ""]?.name ?? "—"}</div>
        {canManage && (
          <Space size="middle" className="positions__mobile-actions">
            <EditablePositionDialog position={record} iconOnly />
            <DeletePositionDialog
              name={record.name}
              onDelete={() => onDelete(record.position_id)}
            />
          </Space>
        )}
      </div>
    ),
  },
];
