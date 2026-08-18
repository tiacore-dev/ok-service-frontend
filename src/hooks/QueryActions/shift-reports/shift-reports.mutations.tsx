import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShiftReport,
  editShiftReport,
  finishShiftReport,
  restoreShiftReport,
  softDeleteShiftReport,
  startShiftReport,
} from "../../../api/shift-reports.api";
import type { ShiftReportCoordinates } from "../../../api/shift-reports.api";
import type { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

export type EditableShiftReport = Omit<
  IShiftReport,
  "shift_report_id" | "number"
>;

export const useCreateShiftReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportData: EditableShiftReport) =>
      createShiftReport(reportData),
    onSuccess: () => {
      // Инвалидируем кэш для списка отчетов
      queryClient.invalidateQueries({
        queryKey: ["shiftReports"],
      });
      notification.success({
        message: "Успешно",
        description: "Отчет по смене создан",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось создать отчет по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to create shift report:", error.message);
    },
  });
};

export const useEditShiftReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      report_id,
      reportData,
    }: {
      report_id: string;
      reportData: EditableShiftReport;
    }) => editShiftReport(report_id, reportData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReports"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shiftReportDetails", variables.report_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["shiftReport", variables.report_id],
      });
      notification.success({
        message: "Успешно",
        description: "Отчет по смене изменён",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось изменить отчет по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to edit shift report:", error.message);
    },
  });
};

export const useStartShiftReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      report_id,
      coordinates,
    }: {
      report_id: string;
      coordinates: ShiftReportCoordinates;
    }) => startShiftReport(report_id, coordinates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shiftReports"] });
      queryClient.invalidateQueries({
        queryKey: ["shiftReport", variables.report_id],
      });
      notification.success({
        message: "Успешно",
        description: "Смена начата",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось начать смену",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to start shift report:", error.message);
    },
  });
};

export const useFinishShiftReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      report_id,
      coordinates,
    }: {
      report_id: string;
      coordinates: ShiftReportCoordinates;
    }) => finishShiftReport(report_id, coordinates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shiftReports"] });
      queryClient.invalidateQueries({
        queryKey: ["shiftReport", variables.report_id],
      });
      notification.success({
        message: "Успешно",
        description: "Смена завершена",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось завершить смену",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to finish shift report:", error.message);
    },
  });
};

export const useSoftDeleteShiftReportMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (report_id: string) => softDeleteShiftReport(report_id),
    onSuccess: (_, report_id) => {
      queryClient.removeQueries({
        queryKey: ["shiftReportDetails", report_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["shiftReports"],
      });
      navigate("/shifts");
      notification.success({
        message: "Успешно",
        description: "Отчет по смене удалён",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось удалить отчет по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to delete shift report:", error.message);
    },
  });
};

export const useRestoreShiftReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (report_id: string) => restoreShiftReport(report_id),
    onSuccess: (_, report_id) => {
      queryClient.invalidateQueries({ queryKey: ["shiftReports"] });
      queryClient.invalidateQueries({ queryKey: ["shiftReport", report_id] });
      notification.success({
        message: "Успешно",
        description: "Отчет по смене восстановлен",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось восстановить отчет по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to restore shift report:", error.message);
    },
  });
};
