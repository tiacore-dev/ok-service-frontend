import * as React from "react";
import { Alert, Modal } from "antd";
import { dateTimestampToLocalDateTimeString } from "../../utils/dateConverter";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import type { IShiftStandard } from "../../interfaces/shiftStandards/IShiftStandard";

interface ShiftCompletionModalProps {
  open: boolean;
  shiftReport: IShiftReport;
  completedAt: number;
  shiftStandard?: IShiftStandard;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const getDurationInMinutes = (dateStart?: number, dateEnd?: number) => {
  if (!dateStart || !dateEnd || dateEnd < dateStart) {
    return undefined;
  }
  return Math.floor((dateEnd - dateStart) / 60_000);
};

const formatDuration = (durationInMinutes?: number) => {
  if (typeof durationInMinutes !== "number") {
    return "—";
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const ShiftCompletionModal = ({
  open,
  shiftReport,
  completedAt,
  shiftStandard,
  loading,
  onConfirm,
  onCancel,
}: ShiftCompletionModalProps) => {
  const durationInMinutes = getDurationInMinutes(
    shiftReport.date_start,
    completedAt,
  );
  const isBelowStandard =
    !shiftReport.short_shift &&
    typeof durationInMinutes === "number" &&
    Boolean(shiftStandard) &&
    durationInMinutes < shiftStandard.standard * 60;

  return (
    <Modal
      title="Завершение смены"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Завершить смену"
      cancelText="Отмена"
    >
      <p>
        Дата и время начала:{" "}
        {shiftReport.date_start
          ? dateTimestampToLocalDateTimeString(shiftReport.date_start)
          : "—"}
      </p>
      <p>
        Дата и время завершения:{" "}
        {dateTimestampToLocalDateTimeString(completedAt)}
      </p>
      <p>Продолжительность: {formatDuration(durationInMinutes)}</p>
      {isBelowStandard && (
        <Alert
          type="warning"
          showIcon
          message={
            shiftStandard.notification_text ||
            "Продолжительность смены меньше установленного норматива."
          }
        />
      )}
    </Modal>
  );
};
