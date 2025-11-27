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
import { useLeavesQuery } from "../../../queries/leaves";
import { leaveReasonesMap } from "../../../queries/leaveReasons";

const DAY = 24 * 60 * 60 * 1000;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(Math.max(n, lo), hi);

interface DownloadUsersReportProps {
  currentFilters?: {
    users?: string[];
    date_from?: number;
    date_to?: number;
  };
}

export const DownloadUsersReport = ({
  currentFilters,
}: DownloadUsersReportProps) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: shiftReportsResponse } = useShiftReportsQuery({
    user: currentFilters?.users,
    date_from: currentFilters?.date_from ?? undefined,
    date_to: currentFilters?.date_to ?? undefined,
    offset: 0,
    limit: 10000,
  });
  const shiftReports = shiftReportsResponse?.shift_reports ?? [];

  const { data: leaveListsData } = useLeavesQuery();
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

      const byUserProjects = new Map<string, Map<string, number>>();

      for (const shiftReport of shiftReports) {
        const dateStr = dateTimestampToLocalString(shiftReport.date);
        const key = `${dateStr}||${shiftReport.project}`; // Если только по дате, то убрать второй ключ

        const userMap =
          byUserProjects.get(shiftReport.user) ?? new Map<string, number>();

        userMap.set(
          key,
          (userMap.get(key) ?? 0) + (shiftReport.shift_report_details_sum ?? 0),
        );
        byUserProjects.set(shiftReport.user, userMap);
      }

      const byUserLeaves = new Map<string, IUserProjectsReportData[]>();

      const filterFrom = currentFilters?.date_from ?? Number.NEGATIVE_INFINITY;
      const filterTo = currentFilters?.date_to ?? Number.POSITIVE_INFINITY;
      const filterUsers = currentFilters?.users;

      if (leaveListsData?.length) {
        for (const leave of leaveListsData) {
          if (filterUsers?.length && !filterUsers.includes(leave.user)) continue;

          const start = leave.start_date ?? leave.end_date ?? null;
          const end = leave.end_date ?? leave.start_date ?? null;
          if (start == null || end == null) continue;

          // пересечение с диапазоном фильтров
          const from = clamp(start, filterFrom, filterTo);
          const to = clamp(end, filterFrom, filterTo);
          if (to < filterFrom || from > filterTo) continue;

          const reasonName =
            leaveReasonesMap[leave.reason]?.name ?? String(leave.reason);

          for (
            let ts = Math.floor(from / DAY) * DAY;
            ts <= Math.floor(to / DAY) * DAY;
            ts += DAY
          ) {
            const dateStr = dateTimestampToLocalString(ts);
            const arr = byUserLeaves.get(leave.user) ?? [];
            arr.push({
              date: dateStr,
              name: reasonName, // ← именно имя причины
              summ: 0, // ← по требованию
            });
            byUserLeaves.set(leave.user, arr);
          }
        }
      }

      const allUsers = Array.from(
        new Set<string>([
          ...Array.from(byUserProjects.keys()),
          ...Array.from(byUserLeaves.keys()),
        ]),
      );

      allUsers.forEach((user) => {
        const projects: IUserProjectsReportData[] = [];

        const userProjectsMap = byUserProjects.get(user);

        if (userProjectsMap) {
          for (const [compoundKey, sum] of userProjectsMap.entries()) {
            const [date, projectId] = compoundKey.split("||");
            const project = projectsMap[projectId];
            projects.push({
              date,
              name: `${objectsMap[project.object].name} (${project.name})`,
              summ: sum,
            });
          }
        }
        const leaveItems = byUserLeaves.get(user) ?? [];
        const combined = [...projects, ...leaveItems];

        combined.sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return a.name.localeCompare(b.name, "ru");
        });

        const total = projects.reduce((acc, p) => acc + p.summ, 0);

        reportData.users.push({
          name: usersMap[user].name,
          projects,
          total,
        });
      });

      return reportData;
    }, [
      currentFilters?.date_from,
      currentFilters?.date_to,
      currentFilters?.users,
      shiftReports,
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
    shiftReports.length === 0 ||
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
