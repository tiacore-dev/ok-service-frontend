import * as React from "react";
import { Button, Space } from "antd";
import { DownloadShiftReport } from "./downloadShiftReport";

interface ShiftReportActionsProps {
  canEdit: boolean;
  onAdd: () => void;
  shiftId: string;
  totalSum: number;
  mobile: boolean;
}

export const ShiftReportActions = ({
  canEdit,
  onAdd,
  shiftId,
  totalSum,
  mobile,
}: ShiftReportActionsProps) => {
  return (
    <Space
      direction={mobile ? "vertical" : "horizontal"}
      className="shift-report__actions"
    >
      {canEdit && (
        <Button
          onClick={onAdd}
          type="primary"
          className="shift-report__add-detail"
        >
          Добавить запись отчета по смене
        </Button>
      )}
      <DownloadShiftReport shiftId={shiftId} summ={totalSum} />
    </Space>
  );
};
