import * as React from "react";
import { DeleteTwoTone, RollbackOutlined } from "@ant-design/icons";
import { Space } from "antd";
import Title from "antd/es/typography/Title";
import { dateTimestampToLocalString } from "../../utils/dateConverter";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { EditableShiftReportDialog } from "../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";
import { ActionDialog } from "../../components/ActionDialogs/ActionDialog";
import { EditableLeaveDialog } from "../../components/ActionDialogs/EditableLeaveDialog/EditableLeaveDialog";

interface ShiftReportHeaderProps {
  shiftReport: IShiftReport;
  userName?: string;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canHardDelete: boolean;
  canCancelByLeave: boolean;
  onDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
  onLeaveCreated: () => void | Promise<void>;
}

export const ShiftReportHeader = ({
  shiftReport,
  userName,
  canEdit,
  canDelete,
  canRestore,
  canHardDelete,
  canCancelByLeave,
  onDelete,
  onRestore,
  onHardDelete,
  onLeaveCreated,
}: ShiftReportHeaderProps) => {
  const shiftNumber = shiftReport.number?.toString().padStart(5, "0");

  return (
    <>
      <Title level={3} className="shift-report__title">
        {`Отчет по смене № ${shiftNumber} от ${dateTimestampToLocalString(shiftReport.date)}, ${userName ?? ""}`}
      </Title>

      <Space
        direction="horizontal"
        size="small"
        className="shift-report__header-actions"
      >
        {canEdit && <EditableShiftReportDialog shiftReport={shiftReport} />}
        {canDelete && (
          <DeleteShiftReportDialog
            onDelete={onDelete}
            number={shiftReport.number}
          />
        )}
        {canRestore && (
          <ActionDialog
            buttonText="Восстановить"
            buttonType="primary"
            buttonIcon={<RollbackOutlined />}
            modalTitle={`Подтверждение восстановления смены ${shiftNumber}`}
            modalText={
              <p>Вы действительно хотите восстановить смену {shiftNumber}?</p>
            }
            onConfirm={onRestore}
          />
        )}
        {canHardDelete && (
          <ActionDialog
            buttonText="Удалить навсегда"
            buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
            modalTitle={`Безвозвратно удалить смену ${shiftNumber}`}
            modalText={
              <p>
                Смена {shiftNumber} будет удалена без возможности
                восстановления. Продолжить?
              </p>
            }
            modalOkText="Удалить"
            onConfirm={onHardDelete}
          />
        )}
        {canCancelByLeave && shiftReport.user && (
          <EditableLeaveDialog
            initialUserId={shiftReport.user}
            buttonText="Снять со смены"
            modalTitle="Создание листа отсутствия"
            onSaved={onLeaveCreated}
          />
        )}
      </Space>
    </>
  );
};
