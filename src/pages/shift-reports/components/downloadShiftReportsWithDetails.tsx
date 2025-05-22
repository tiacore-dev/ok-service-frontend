"use client";

import { Button } from "antd";
import * as React from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import type { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { getWorksMap } from "../../../store/modules/pages/selectors/works.selector";
import { fetchShiftReportDetails } from "../../../api/shift-report-details.api";

interface IExportedReportData {
  number: number;
  date: string;
  user: string;
  object: string;
  project: string;
  project_leader: string;
  sum: string;
  signed: string;
}

interface IExportedDetailData {
  isDetail: boolean;
  project_work: string;
  work: string;
  quantity: number;
  sum: number;
}

type ExportRow = IExportedReportData | IExportedDetailData;

interface DownloadShiftReportsWithDetailsProps {
  currentFilters?: {
    user?: string;
    project?: string;
    date_from?: number;
    date_to?: number;
  };
}

export const DownloadShiftReportsWithDetails: React.FC<
  DownloadShiftReportsWithDetailsProps
> = ({ currentFilters }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  // Получаем данные из React Query
  const { data: shiftReportsResponse } = useShiftReportsQuery({
    ...currentFilters,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const worksMap = useSelector(getWorksMap);

  const exportToCSV = React.useCallback(async () => {
    try {
      setIsExporting(true);

      // Подготовка основных данных отчетов
      const reportRows: IExportedReportData[] = shiftReportsData.map(
        (el: IShiftReport) => ({
          number: el.number,
          date: dateTimestampToLocalString(el.date),
          user: usersMap[el.user]?.name || "",
          object: objectsMap[projectsMap[el.project]?.object]?.name || "",
          project: projectsMap[el.project]?.name || "",
          project_leader:
            usersMap[projectsMap[el.project]?.project_leader]?.name || "",
          sum: el.shift_report_details_sum?.toString().replace(".", ",") || "0",
          signed: el.signed ? "Да" : "Нет",
        })
      );

      // Заголовки для основных данных
      const reportHeaders = [
        "Номер",
        "Дата",
        "Исполнитель",
        "Объект",
        "Спецификация",
        "Прораб",
        "Сумма",
        "Согласовано",
      ];

      // Заголовки для детализации
      const detailHeaders = [
        "",
        "Наименование",
        "Работа",
        "Количество",
        "Сумма",
      ];

      // Собираем все строки в один массив
      const allRows: ExportRow[] = [];

      // Для каждого отчета получаем детали и добавляем их после основной строки
      for (const report of reportRows) {
        // Добавляем основную строку отчета
        allRows.push(report);

        // Получаем детали для этого отчета
        const reportId = shiftReportsData.find(
          (r: IShiftReport) => r.number === report.number
        )?.shift_report_id;
        if (reportId) {
          try {
            const detailsResponse = await fetchShiftReportDetails({
              shift_report: reportId,
            });
            const details = detailsResponse.shift_report_details || [];

            // Добавляем строки с деталями
            for (const detail of details) {
              const projectWorkName = projectsMap[detail.project]?.name || "";
              allRows.push({
                isDetail: true,
                project_work: projectWorkName,
                work: worksMap[detail.work]?.name || "",
                quantity: detail.quantity,
                sum: detail.summ,
              });
            }
          } catch (error) {
            console.error(
              `Ошибка при получении деталей для отчета ${reportId}:`,
              error
            );
          }
        }
      }

      // Формируем CSV
      let csvContent = "\uFEFF"; // BOM для корректной кодировки

      // Добавляем заголовки
      csvContent += reportHeaders.join(";") + "\r\n";

      // Добавляем строки
      for (const row of allRows) {
        if ("isDetail" in row) {
          // Это строка детализации
          const values = [
            "", // Пустая ячейка для отступа
            row.project_work,
            row.work,
            row.quantity.toString(),
            row.sum.toString().replace(".", ","),
          ];
          csvContent +=
            values
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(";") + "\r\n";
        } else {
          // Это основная строка отчета
          const values = Object.values(row);
          csvContent +=
            values
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(";") + "\r\n";
        }
      }

      // Создаем и скачиваем файл
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "detailed_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Ошибка при экспорте отчета:", error);
    } finally {
      setIsExporting(false);
    }
  }, [shiftReportsData, projectsMap, objectsMap, usersMap, worksMap]);

  return (
    <Button
      icon={<FileExcelOutlined />}
      onClick={exportToCSV}
      loading={isExporting}
      disabled={shiftReportsData.length === 0}
    >
      Скачать детализированный отчет
    </Button>
  );
};
