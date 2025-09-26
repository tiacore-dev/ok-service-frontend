"use client";

import { Button, Tooltip } from "antd";
import * as React from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../../store/modules/pages/selectors/objects.selector";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { fetchShiftReportDetails } from "../../../api/shift-report-details.api";
import type { IState } from "../../../store/modules";
import { generateObjectVolumeReport } from "../../../api/object-volume-report.api";
import type {
  IObjectVolumeReport,
  IObjectVolumeReportObject,
} from "../../../interfaces/reports/IObjectVolumeReport";

interface DownloadObjectVolumeReportProps {
  currentFilters?: {
    user?: string;
    project?: string;
    date_from?: number;
    date_to?: number;
  };
}

export const DownloadObjectVolumeReport: React.FC<
  DownloadObjectVolumeReportProps
> = ({ currentFilters }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: shiftReportsResponse } = useShiftReportsQuery({
    ...currentFilters,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);

  const allProjectWorks = useSelector(
    (state: IState) => state.pages.projectWorks.data
  );

  const createObjectVolumeReport = async (): Promise<IObjectVolumeReport> => {
    const reportData: IObjectVolumeReport = {
      date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
      date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
      objects: [],
    };

    // Группируем данные по объектам и проектам
    const objectsMap_local: Record<string, IObjectVolumeReportObject> = {};

    for (const report of shiftReportsData) {
      if (!report.shift_report_id) continue;

      try {
        const detailsResponse = await fetchShiftReportDetails({
          shift_report: report.shift_report_id,
        });
        const details = detailsResponse.shift_report_details || [];

        if (details.length === 0) continue;

        const project = projectsMap[report.project];
        if (!project) continue;

        const objectName =
          objectsMap[project.object]?.name || "Неизвестный объект";
        const projectName = project.name || "Неизвестный проект";

        // Создаем или получаем объект
        let objectData = objectsMap_local[objectName];
        if (!objectData) {
          objectData = {
            name: objectName,
            projects: [],
          };
          objectsMap_local[objectName] = objectData;
          reportData.objects.push(objectData);
        }

        // Создаем или получаем проект
        let projectData = objectData.projects.find(
          (p) => p.name === projectName
        );
        if (!projectData) {
          projectData = {
            name: projectName,
            project_details: [],
          };
          objectData.projects.push(projectData);
        }

        // Обрабатываем детали отчета
        details.forEach(
          (detail: { project_work: string; quantity: number }) => {
            // Находим project_work по ID
            const projectWork = allProjectWorks.find(
              (pw) => pw.project_work_id === detail.project_work
            );

            const projectDetailName =
              projectWork?.project_work_name || "Неизвестная запись";

            // Ищем существующую запись или создаем новую
            let projectDetail = projectData!.project_details.find(
              (pd) => pd.name === projectDetailName
            );

            if (!projectDetail) {
              projectDetail = {
                name: projectDetailName,
                quantity: 0,
              };
              projectData!.project_details.push(projectDetail);
            }

            // Суммируем количество
            projectDetail.quantity += detail.quantity;
          }
        );
      } catch (error) {
        console.error(
          `Ошибка при получении деталей для отчета ${report.shift_report_id}:`,
          error
        );
      }
    }

    return reportData;
  };

  const handleDownload = async (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Очистка
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  const exportToXLSX = React.useCallback(async () => {
    try {
      setIsExporting(true);
      const reportData = await createObjectVolumeReport();

      console.log(
        " Object Volume Report Data:",
        JSON.stringify(reportData, null, 2)
      );
      console.log(" Objects count:", reportData.objects.length);
      console.log(
        " Date range:",
        reportData.date_from,
        "to",
        reportData.date_to
      );

      const dateFrom =
        dateTimestampToLocalString(currentFilters?.date_from) || "";
      const dateTo = dateTimestampToLocalString(currentFilters?.date_to) || "";
      const fileName =
        `object_volume_report_${dateFrom}_${dateTo}.xlsx`.replace(/\s+/g, "_");
      const reportName = `object_volume_report_${dateFrom}_${dateTo}`.replace(
        /\s+/g,
        "_"
      );

      console.log(" Calling generateObjectVolumeReport with:", {
        reportName,
        dataStructure: {
          objects: reportData.objects.length,
          hasData: reportData.objects.some((obj) => obj.projects.length > 0),
        },
      });

      const blob = await generateObjectVolumeReport(reportData, reportName);

      console.log(" Received blob:", {
        size: blob.size,
        type: blob.type,
      });

      await handleDownload(blob, fileName);
    } catch (error) {
      console.error("Ошибка при экспорте отчета по объектам:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    shiftReportsData,
    projectsMap,
    objectsMap,
    allProjectWorks,
    currentFilters?.date_from,
    currentFilters?.date_to,
  ]);

  const isDisabled =
    shiftReportsData.length === 0 ||
    !currentFilters?.date_from ||
    !currentFilters?.date_to;

  const button = (
    <Button
      icon={<FileExcelOutlined />}
      onClick={exportToXLSX}
      loading={isExporting}
      disabled={isDisabled}
      type="default"
    >
      Скачать отчет по объектам
    </Button>
  );

  return isDisabled ? (
    <Tooltip title="Для скачивания отчета необходимо выбрать фильтры по дате">
      {button}
    </Tooltip>
  ) : (
    button
  );
};
