import { useQuery } from "@tanstack/react-query";
import { fetchShiftReports } from "../../../api/shift-reports.api";
import { IShiftReportQueryParams } from "../../../interfaces/shiftReports/IShiftReport";
import { fetchShiftReport } from "../../../api/shift-reports.api";
import { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";

export const useShiftReportsQuery = (filters?: IShiftReportQueryParams) => {
  return useQuery({
    queryKey: ["shiftReports", filters], // Ключ запроса, уникальный для каждого набора фильтров
    queryFn: () => fetchShiftReports(filters),
    retry: false,
    placeholderData: (previousData) => previousData, // Аналог keepPreviousData в новых версиях
  });
};

export const useShiftReportQuery = (report_id: string | undefined) => {
  return useQuery<IShiftReport>({
    queryKey: ["shiftReport", report_id], // Ключ запроса с ID отчета
    queryFn: () => {
      if (!report_id) {
        throw new Error("Report ID is required");
      }
      return fetchShiftReport(report_id);
    },
    enabled: !!report_id, // Запрос выполнится только если report_id существует
    // retry: false,
    // staleTime: 5 * 60 * 1000, // 5 минут до устаревания данных
    // placeholderData: undefined, // Можно задать placeholder данные если нужно
  });
};
