"use client";

import { Button, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import { FileExcelOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { EditableShiftReportDialog } from "../../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import type { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { DownloadShiftReportsWithDetails } from "./downloadShiftReportsWithDetails";
import { useNavigate } from "react-router-dom";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { DownloadObjectVolumeReport } from "./downloadObjectVolumeReport";
import { useUsersMap } from "../../../queries/users";
import { useObjectsMap } from "../../../queries/objects";
import { useProjectsMap } from "../../../queries/projects";
import { DownloadUsersReport } from "./downloadUsersReport";

interface IExportedData {
  number: number;
  date: string;
  user: string;
  object: string;
  project: string;
  project_leader: string;
  sum: string;
  signed: string;
}

interface ActionsProps {
  currentFilters?: {
    users?: string[];
    projects?: string[];
    date_from?: number | null;
    date_to?: number | null;
  };
}

export const Actions: React.FC<ActionsProps> = ({ currentFilters }) => {
  // Получаем данные из React Query
  const { data: shiftReportsResponse } = useShiftReportsQuery({
    user: currentFilters?.users,
    project: currentFilters?.projects,
    date_from: currentFilters?.date_from ?? undefined,
    date_to: currentFilters?.date_to ?? undefined,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const role = useSelector(getCurrentRole);

  const { projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();
  const { usersMap } = useUsersMap();
  const navigate = useNavigate();
  const exportedData: IExportedData[] = React.useMemo(
    () =>
      shiftReportsData.map((el: IShiftReport) => ({
        number: el.number,
        date: dateTimestampToLocalString(el.date),
        user: usersMap[el.user]?.name || "",
        object: objectsMap[projectsMap[el.project]?.object]?.name || "",
        project: projectsMap[el.project]?.name || "",
        project_leader:
          usersMap[projectsMap[el.project]?.project_leader]?.name || "",
        sum: el.shift_report_details_sum?.toString().replace(".", ",") || "0",
        signed: el.signed ? "Да" : "Нет",
      })),
    [shiftReportsData, projectsMap, objectsMap, usersMap],
  );

  const exportToCSV = React.useCallback(
    (data: IExportedData[], filename = "report.csv") => {
      const headers = [
        "Номер",
        "Дата",
        "Исполнитель",
        "Объект",
        "Спецификация",
        "Прораб",
        "Сумма",
        "Согласовано",
      ].join(";");

      const rows = data
        .map((obj) => {
          const values = Object.values(obj).map((value) => {
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          return values.join(";");
        })
        .join("\r\n");

      const csvContent = "\uFEFF" + headers + "\r\n" + rows;

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [],
  );

  return (
    <div className="shift-reports_actions">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        {role !== RoleId.USER && <EditableShiftReportDialog />}
        <Button
          icon={<FileExcelOutlined />}
          onClick={() => exportToCSV(exportedData, "report.csv")}
          style={{ marginRight: 8 }}
        >
          Скачать отчет
        </Button>
        {role !== RoleId.USER && (
          <DownloadShiftReportsWithDetails currentFilters={currentFilters} />
        )}
        {role !== RoleId.USER && (
          <DownloadObjectVolumeReport currentFilters={currentFilters} />
        )}
        {role !== RoleId.USER && (
          <DownloadUsersReport currentFilters={currentFilters} />
        )}
        {role !== RoleId.USER && (
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => navigate("/shifts/assignment")}
            style={{ marginRight: 8 }}
          >
            Распределение смен
          </Button>
        )}
      </Space>
    </div>
  );
};
