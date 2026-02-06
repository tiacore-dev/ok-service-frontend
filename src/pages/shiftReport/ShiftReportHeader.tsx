import * as React from "react";
import { Space } from "antd";
import Title from "antd/es/typography/Title";
import { dateTimestampToLocalString } from "../../utils/dateConverter";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { EditableShiftReportDialog } from "../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";

interface ShiftReportHeaderProps {
  shiftReport: IShiftReport;
  userName?: string;
  canEdit: boolean;
  onDelete: () => void;
}

export const ShiftReportHeader = ({
  shiftReport,
  userName,
  canEdit,
  onDelete,
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
        {canEdit && (
          <DeleteShiftReportDialog
            onDelete={onDelete}
            number={shiftReport.number}
          />
        )}
      </Space>
    </>
  );
};
