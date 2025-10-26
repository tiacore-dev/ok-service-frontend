import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notification } from "antd";
import { IShiftReportDetail } from "../../../../interfaces/shiftReportDetails/IShiftReportDetail";
import {
  createShiftReportDetailApi,
  deleteShiftReportDetailApi,
  editShiftReportDetailApi,
} from "../../../../api/shift-report-details.api";

export type EditableShiftReportDetail = Omit<
  IShiftReportDetail,
  "shift_report_detail_id"
>;

export const useCreateShiftReportDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditableShiftReportDetail) =>
      createShiftReportDetailApi(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReportDetails", variables.shift_report],
      });
      notification.success({
        message: "Успешно",
        description: "Запись отчета по смене создана",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось создать запись отчета по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to create shift report detail:", error.message);
    },
  });
};

export const useEditShiftReportDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EditableShiftReportDetail;
    }) => editShiftReportDetailApi(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReports"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shiftReport", variables.id], // Добавьте эту строку
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
        description: "Не удалось изменить запись отчета по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to edit shift report detail:", error.message);
    },
  });
};

export const useDeleteShiftReportDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; shiftReportId: string }) =>
      deleteShiftReportDetailApi(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReportDetails", variables.shiftReportId],
      });
      notification.success({
        message: "Успешно",
        description: "Запись отчета по смене удалена",
        placement: "bottomRight",
        duration: 2,
      });
    },
    onError: (error: Error) => {
      notification.error({
        message: "Ошибка",
        description: "Не удалось удалить запись отчета по смене",
        placement: "bottomRight",
        duration: 2,
      });
      console.error("Failed to delete shift report detail:", error.message);
    },
  });
};
