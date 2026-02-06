"use client";

import * as React from "react";
import { FileExcelOutlined, LoadingOutlined } from "@ant-design/icons";
import { useObjectsMap } from "../../../../queries/objects";
import { useProjectsMap } from "../../../../queries/projects";
import { dateTimestampToLocalString } from "../../../../utils/dateConverter";
import { useShiftReportsQuery } from "../../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { fetchShiftReportDetails } from "../../../../api/shift-report-details.api";
import { useWorksMap } from "../../../../queries/works";
import { generateDocument } from "../../../../api/download.api";
import type { IProjectWorksList } from "../../../../interfaces/projectWorks/IProjectWorksList";
import { useUsersMap } from "../../../../queries/users";
import { useProjectWorksMap } from "../../../../queries/projectWorks";
import { useLeavesQuery } from "../../../../queries/leaves";
import { leaveReasonesMap } from "../../../../queries/leaveReasons";

const DAY = 24 * 60 * 60 * 1000;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(Math.max(n, lo), hi);

const toLocalMidnightTs = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

interface DownloadShiftReportsWithDetailsProps {
  currentFilters?: {
    users?: string[];
    projects?: string[];
    date_from?: number;
    date_to?: number;
  };
}

export interface ExportExcelTemplate {
  date_to: string;
  date_from: string;
  user: string;
  total_summ: number;
  unique_days: number;
  objects: ExportExcelObject[];
}

export interface ExportExcelObject {
  name: string;
  details_summ: number;
  details: ExportExcelObjectDetails[];
}

export interface ExportExcelObjectDetails {
  date: string;
  work_name: string;
  work_category: string;
  quantity: number;
  coast: number;
  detail_summ: number;
}

type ShiftReportDetail = {
  work?: string;
  quantity?: number;
  summ?: number;
  project_work?: string;
};

export const useDownloadShiftReportsWithDetails = ({
  currentFilters,
}: DownloadShiftReportsWithDetailsProps) => {
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
  const { usersMap } = useUsersMap();
  const { worksMap } = useWorksMap();

  const { projectWorks: allProjectWorks = [] } = useProjectWorksMap();
  const { data: leaveListsData } = useLeavesQuery();

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

  const selectedUserId =
    currentFilters?.users && currentFilters.users.length === 1
      ? currentFilters.users[0]
      : undefined;

  const createExportTemplate =
    React.useCallback(async (): Promise<ExportExcelTemplate> => {
      const exportData: ExportExcelTemplate = {
        date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
        date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
        user: selectedUserId ? usersMap[selectedUserId]?.name || "" : "",
        total_summ: 0,
        unique_days: 0,
        objects: [],
      };

      if (shiftReportsData.length === 0) {
        return exportData;
      }

      const uniqueDatesWithDetails = new Set<string>();
      const objectsMapByProject: Record<string, ExportExcelObject> = {};

      const validReports = shiftReportsData.filter((report: any) =>
        Boolean(report?.shift_report_id),
      );

      if (validReports.length === 0) {
        return exportData;
      }

      const reportsWithDetails = await Promise.all(
        validReports.map(async (report: any) => {
          try {
            const detailsResponse = await fetchShiftReportDetails({
              shift_report: report.shift_report_id,
            });

            const details = (detailsResponse.shift_report_details ||
              []) as ShiftReportDetail[];

            return {
              report,
              details,
            };
          } catch (error) {
            console.error(
              `Ошибка при получении деталей для отчета ${report.shift_report_id}:`,
              error,
            );
            return null;
          }
        }),
      );

      for (const reportWithDetails of reportsWithDetails) {
        if (!reportWithDetails) continue;

        const { report, details } = reportWithDetails;
        if (!details.length) continue;

        const reportDate = dateTimestampToLocalString(report.date);
        uniqueDatesWithDetails.add(reportDate);

        const project = projectsMap[report.project];
        const objectName = project
          ? objectsMap[project.object]?.name || ""
          : "";
        const projectName = project?.name || "";
        const objectKey = `${objectName} (${projectName})`;

        let existingObject = objectsMapByProject[objectKey];
        if (!existingObject) {
          existingObject = {
            name: objectKey,
            details_summ: 0,
            details: [],
          };

          objectsMapByProject[objectKey] = existingObject;
          exportData.objects.push(existingObject);
        }

        const reportSum = report.shift_report_details_sum || 0;
        exportData.total_summ += reportSum;
        existingObject.details_summ += reportSum;

        for (const detail of details) {
          const projectWorkId = detail.project_work;
          const projectWork = projectWorkId
            ? projectWorksById[projectWorkId]
            : undefined;
          const workId = detail.work;
          const categoryWorkName = workId ? worksMap[workId]?.name || "" : "";
          const projectWorkName = projectWork?.project_work_name || "";
          const quantity = detail.quantity ?? 0;
          const summ = detail.summ ?? 0;
          const coast = quantity > 0 ? summ / quantity : 0;

          existingObject.details.push({
            date: reportDate,
            work_name: projectWorkName,
            work_category: categoryWorkName,
            quantity,
            coast,
            detail_summ: summ,
          });
        }
      }

      exportData.unique_days = uniqueDatesWithDetails.size;

      if (selectedUserId && leaveListsData?.length) {
        const filterFrom = currentFilters?.date_from ?? 0;
        const filterTo = currentFilters?.date_to ?? 0;

        const leavesObject: ExportExcelObject = {
          name: "Отсутствовал",
          details_summ: 0,
          details: [],
        };

        for (const leave of leaveListsData) {
          if (leave.user !== selectedUserId) {
            continue;
          }
          const start = leave.start_date ?? leave.end_date ?? null;
          const end = leave.end_date ?? leave.start_date ?? null;
          if (start == null || end == null) {
            continue;
          }

          const from = clamp(start, filterFrom, filterTo);
          const to = clamp(end, filterFrom, filterTo);

          const startTs = toLocalMidnightTs(from);
          const endTs = toLocalMidnightTs(to);

          if (to < filterFrom || from > filterTo) {
          }

          const reasonName =
            leaveReasonesMap[leave.reason]?.name ?? String(leave.reason);

          for (let ts = startTs; ts <= endTs; ts += DAY) {
            const dateStr = dateTimestampToLocalString(ts);

            // чтобы unique_days учитывал отсутствия тоже
            uniqueDatesWithDetails.add(dateStr);

            leavesObject.details.push({
              date: dateStr,
              work_name: reasonName,
              work_category: "",
              quantity: 0,
              coast: 0,
              detail_summ: 0,
            });
          }

          if (leavesObject.details.length) {
            // сортировка по дате/причине
            leavesObject.details.sort((a, b) => {
              if (a.date !== b.date) return a.date < b.date ? -1 : 1;
              return a.work_name.localeCompare(b.work_name, "ru");
            });

            exportData.objects.push(leavesObject);
          }
        }
      }

      return exportData;
    }, [
      currentFilters?.date_from,
      currentFilters?.date_to,
      selectedUserId,
      objectsMap,
      projectWorksById,
      projectsMap,
      shiftReportsData,
      usersMap,
      worksMap,
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
      const exportTemplate = await createExportTemplate();

      const userName = selectedUserId
        ? usersMap[selectedUserId]?.name || "unknown"
        : "unknown";
      const dateFrom =
        dateTimestampToLocalString(currentFilters?.date_from) || "";
      const dateTo = dateTimestampToLocalString(currentFilters?.date_to) || "";
      const fileName =
        `shift_report_${userName}_${dateFrom}_${dateTo}.xlsx`.replace(
          /\s+/g,
          "_",
        );
      const reportName =
        `shift_report_${userName}_${dateFrom}_${dateTo}`.replace(/\s+/g, "_");

      const blob = await generateDocument(exportTemplate, reportName);

      await handleDownload(blob, fileName);
    } catch (error) {
      console.error("Ошибка при экспорте отчета:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    createExportTemplate,
    currentFilters?.date_from,
    currentFilters?.date_to,
    selectedUserId,
    usersMap,
  ]);

  const disabled =
    shiftReportsData.length === 0 ||
    !currentFilters?.date_from ||
    !currentFilters?.date_to ||
    !selectedUserId;

  return {
    disabled,
    tooltipTitle:
      "Для скачивания отчета необходимо выбрать фильтры по дате и пользователю",
    icon: isExporting ? <LoadingOutlined /> : <FileExcelOutlined />,
    label: "Зарплатная ведомость",
    onClick: exportToXLSX,
  };
};
