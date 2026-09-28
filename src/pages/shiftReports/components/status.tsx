import * as React from "react";
import type { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";

type ShiftReportStatus = "not-opened" | "signed" | "not-signed" | "empty";

const statusLabels: Record<ShiftReportStatus, string> = {
  "not-opened": "Не открыто",
  signed: "Согласовано",
  "not-signed": "Не согласовано",
  empty: "Не заполнено",
};

export const getShiftReportStatus = (
  report: IShiftReportsListColumn,
): ShiftReportStatus => {
  if (!report.date_start) return "not-opened";
  if (report.signed) return "signed";
  if (report.shift_report_details_sum > 0) return "not-signed";
  return "empty";
};

export const ShiftReportStatusIndicator: React.FC<{
  report: IShiftReportsListColumn;
}> = ({ report }) => {
  const status = getShiftReportStatus(report);

  return (
    <span className="shift-reports__status">
      <span
        aria-hidden="true"
        className={`shift-reports__status-icon--${status}`}
      />
      {statusLabels[status]}
    </span>
  );
};
