"use client";

import { Button, Tooltip } from "antd";
import * as React from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { useObjectsMap } from "../../../queries/objects";
import { useProjectsMap } from "../../../queries/projects";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { useUsersMap } from "../../../queries/users";
import {
  IUserProjectsReportData,
  IUsersReport,
} from "../../../interfaces/reports/IUsersReport";
import { generateUsersReport } from "../../../api/users-report.api";

interface DownloadUsersReportProps {
  currentFilters?: {
    user?: string;
    date_from?: number;
    date_to?: number;
  };
}

export const DownloadUsersReport = ({
  currentFilters,
}: DownloadUsersReportProps) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: shiftReportsResponse } = useShiftReportsQuery({
    ...currentFilters,
    offset: 0,
    limit: 10000,
  });

  const { projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();
  const { usersMap } = useUsersMap();

  const createObjectVolumeReport =
    React.useCallback(async (): Promise<IUsersReport> => {
      const reportData: IUsersReport = {
        date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
        date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
        users: [],
      };

      const params: Record<string, string> = {
        limit: "10000",
      };

      if (currentFilters?.date_from) {
        params.date_from = String(currentFilters.date_from);
      }

      if (currentFilters?.date_to) {
        params.date_to = String(currentFilters.date_to);
      }

      if (currentFilters?.user) {
        params.user = currentFilters.user;
      }

      const byUser = new Map<string, Map<string, number>>();

      for (const shiftReport of shiftReportsResponse.shift_reports) {
        const dateStr = dateTimestampToLocalString(shiftReport.date);
        const key = `${dateStr}||${shiftReport.project}`; // Если только по дате, то убрать второй ключ

        const userMap =
          byUser.get(shiftReport.user) ?? new Map<string, number>();

        userMap.set(
          key,
          (userMap.get(key) ?? 0) + (shiftReport.shift_report_details_sum ?? 0),
        );
        byUser.set(shiftReport.user, userMap);
      }

      for (const [user, userData] of Array.from(byUser.entries())) {
        const projects: IUserProjectsReportData[] = [];

        for (const [compoundKey, sum] of Array.from(userData.entries())) {
          const [date, projectId] = compoundKey.split("||");
          const project = projectsMap[projectId];
          projects.push({
            date,
            name: `${objectsMap[project.object].name} (${project.name})`,
            summ: sum,
          });
        }

        projects.sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return a.name.localeCompare(b.name, "ru");
        });

        const total = projects.reduce((acc, p) => acc + p.summ, 0);

        reportData.users.push({
          name: usersMap[user].name,
          projects,
          total,
        });
      }

      return reportData;
    }, [
      currentFilters?.date_from,
      currentFilters?.date_to,
      currentFilters?.user,
      shiftReportsResponse,
      objectsMap,
      projectsMap,
      usersMap,
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
      const fileName = `users_report_${dateFrom}_${dateTo}.xlsx`.replace(
        /\s+/g,
        "_",
      );
      const reportName = `users_report_${dateFrom}_${dateTo}`.replace(
        /\s+/g,
        "_",
      );

      const blob = await generateUsersReport(reportData, reportName);

      await handleDownload(blob, fileName);
    } catch (error) {
      console.error("Ошибка при экспорте отчета по монтажникам:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    createObjectVolumeReport,
    currentFilters?.date_from,
    currentFilters?.date_to,
  ]);

  const isDisabled =
    !shiftReportsResponse ||
    !shiftReportsResponse.shift_reports ||
    shiftReportsResponse.shift_reports.length === 0 ||
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
      Скачать отчет по монтажникам
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
