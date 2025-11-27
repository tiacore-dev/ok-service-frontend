"use client";

import { Button, Tooltip } from "antd";
import * as React from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { useObjectsMap } from "../../../queries/objects";
import { useProjectsMap } from "../../../queries/projects";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { fetchShiftReportDetails } from "../../../api/shift-report-details.api";
import { generateObjectVolumeReport } from "../../../api/object-volume-report.api";
import type {
  IObjectVolumeReport,
  IObjectVolumeReportObject,
} from "../../../interfaces/reports/IObjectVolumeReport";
import type { IProjectWorksList } from "../../../interfaces/projectWorks/IProjectWorksList";
import type { IShiftReportDetail } from "../../../interfaces/shiftReportDetails/IShiftReportDetail";
import { useProjectWorksMap } from "../../../queries/projectWorks";

interface DownloadObjectVolumeReportProps {
  currentFilters?: {
    users?: string[];
    projects?: string[];
    date_from?: number;
    date_to?: number;
  };
}

export const DownloadObjectVolumeReport: React.FC<
  DownloadObjectVolumeReportProps
> = ({ currentFilters }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: shiftReportsResponse } = useShiftReportsQuery({
    user: currentFilters?.users,
    project: currentFilters?.projects,
    date_from: currentFilters?.date_from ?? undefined,
    date_to: currentFilters?.date_to ?? undefined,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const { projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();

  const { projectWorks: allProjectWorks = [] } = useProjectWorksMap();

  const projectWorksById = React.useMemo(() => {
    const map: Record<string, IProjectWorksList> = {};
    const projectWorksArray = Array.isArray(allProjectWorks)
      ? (allProjectWorks as IProjectWorksList[])
      : [];

    for (const projectWork of projectWorksArray) {
      const projectWorkId = projectWork?.project_work_id;
      if (projectWorkId) {
        map[projectWorkId] = projectWork;
      }
    }

    return map;
  }, [allProjectWorks]);

  const createObjectVolumeReport =
    React.useCallback(async (): Promise<IObjectVolumeReport> => {
      const reportData: IObjectVolumeReport = {
        date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
        date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
        objects: [],
      };

      const objectsMapLocal: Record<string, IObjectVolumeReportObject> = {};

      const params: Record<string, string> = {
        limit: "10000",
      };

      if (currentFilters?.date_from) {
        params.date_from = String(currentFilters.date_from);
      }

      if (currentFilters?.date_to) {
        params.date_to = String(currentFilters.date_to);
      }

      if (currentFilters?.users?.length) {
        params.user = currentFilters.users.join(",");
      }

      if (currentFilters?.projects?.length) {
        params.project = currentFilters.projects.join(",");
      }

      let details: IShiftReportDetail[] = [];

      try {
        const detailsResponse = await fetchShiftReportDetails(params);
        details = (detailsResponse.shift_report_details ||
          []) as IShiftReportDetail[];
      } catch (error) {
        console.error("Ошибка при загрузке деталей отчетов:", error);
        return reportData;
      }

      if (details.length === 0) {
        return reportData;
      }

      const detailsByShiftReportId = details.reduce(
        (acc: Record<string, IShiftReportDetail[]>, detail) => {
          if (!detail?.shift_report) {
            return acc;
          }

          if (!acc[detail.shift_report]) {
            acc[detail.shift_report] = [];
          }

          acc[detail.shift_report].push(detail);
          return acc;
        },
        {},
      );

      for (const report of shiftReportsData) {
        const shiftReportId = report.shift_report_id as string;
        const reportDetails = detailsByShiftReportId[shiftReportId] || [];

        if (reportDetails.length === 0) {
          continue;
        }

        const project = projectsMap[report.project];
        if (!project) continue;

        const objectName =
          objectsMap[project.object]?.name || "Неизвестный объект";
        const projectName = project.name || "Неизвестный проект";

        let objectData = objectsMapLocal[objectName];
        if (!objectData) {
          objectData = {
            name: objectName,
            projects: [],
          };
          objectsMapLocal[objectName] = objectData;
          reportData.objects.push(objectData);
        }

        let projectData = objectData.projects.find(
          (p) => p.name === projectName,
        );
        if (!projectData) {
          projectData = {
            name: projectName,
            project_details: [],
          };
          objectData.projects.push(projectData);
        }

        for (const detail of reportDetails) {
          const projectWork = projectWorksById[detail.project_work];
          const projectDetailName =
            projectWork?.project_work_name || "Неизвестная запись";

          let projectDetail = projectData.project_details.find(
            (pd) => pd.name === projectDetailName,
          );

          if (!projectDetail) {
            projectDetail = {
              name: projectDetailName,
              quantity: 0,
            };
            projectData.project_details.push(projectDetail);
          }

          projectDetail.quantity += detail.quantity;
        }
      }

      return reportData;
    }, [
      currentFilters?.date_from,
      currentFilters?.date_to,
      currentFilters?.projects,
      currentFilters?.users,
      objectsMap,
      projectWorksById,
      projectsMap,
      shiftReportsData,
    ]);

  const handleDownload = async (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  const exportToXLSX = React.useCallback(async () => {
    try {
      setIsExporting(true);
      const reportData = await createObjectVolumeReport();

      const dateFrom =
        dateTimestampToLocalString(currentFilters?.date_from) || "";
      const dateTo = dateTimestampToLocalString(currentFilters?.date_to) || "";
      const fileName =
        `object_volume_report_${dateFrom}_${dateTo}.xlsx`.replace(/\s+/g, "_");
      const reportName = `object_volume_report_${dateFrom}_${dateTo}`.replace(
        /\s+/g,
        "_",
      );

      const blob = await generateObjectVolumeReport(reportData, reportName);

      await handleDownload(blob, fileName);
    } catch (error) {
      console.error("Ошибка при экспорте отчета по объектам:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    createObjectVolumeReport,
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
