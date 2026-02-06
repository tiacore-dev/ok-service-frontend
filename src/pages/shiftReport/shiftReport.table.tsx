import * as React from "react";
import { Button, Popconfirm, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import type { IShiftReportDetailsListColumn } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { RoleId } from "../../interfaces/roles/IRole";

export type ShiftReportDetailsTableRow = IShiftReportDetailsListColumn;
export type ShiftReportColumn = ColumnType<ShiftReportDetailsTableRow> & {
  hidden?: boolean;
};

interface CreateShiftReportColumnsParams {
  canEdit: boolean;
  currentRole: RoleId;
  hasShiftReport: boolean;
  isSigned: boolean;
  mobile: boolean;
  onEdit: (record: ShiftReportDetailsTableRow) => void;
  onDelete: (key: string) => void;
  workNameById: (workId: string) => string | undefined;
}

export const createShiftReportColumns = (
  params: CreateShiftReportColumnsParams,
): ShiftReportColumn[] => {
  const {
    canEdit,
    currentRole,
    hasShiftReport,
    isSigned,
    mobile,
    onEdit,
    onDelete,
    workNameById,
  } = params;

  return [
    {
      title: "Наименование",
      dataIndex: "project_work",
      key: "project_work",
      render: (value: { project_work_id: string; name: string }) => {
        return value.name;
      },
    },
    {
      title: "Работа",
      dataIndex: "work",
      key: "work",
      render: workNameById,
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
    },
    {
      title: "Проверка",
      dataIndex: "check",
      key: "check",
      hidden: currentRole === RoleId.USER || !hasShiftReport || isSigned,
      render: (text: string, record: IShiftReportDetailsListColumn) => (
        <span
          className={
            record.blocked ? "shift-report__blocked-text" : undefined
          }
        >
          {text}
        </span>
      ),
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: mobile ? undefined : "116px",
      hidden: !canEdit,
      render: (_: string, record: IShiftReportDetailsListColumn) => (
        <Space>
          <Button
            icon={<EditTwoTone twoToneColor="#e40808" />}
            type="link"
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Удалить?"
            onConfirm={() => onDelete(record.key)}
          >
            <Button
              icon={<DeleteTwoTone twoToneColor="#e40808" />}
              type="link"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
