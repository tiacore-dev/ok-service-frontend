"use client";

import { Button, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import { FileExcelOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { EditableShiftReportDialog } from "../../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import type { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { DownloadShiftReportsWithDetails } from "./downloadShiftReportsWithDetails";
import { useNavigate } from "react-router-dom";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { DownloadObjectVolumeReport } from "./downloadObjectVolumeReport";

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
    user?: string;
    project?: string;
    date_from?: number;
    date_to?: number;
  };
}

export const Actions: React.FC<ActionsProps> = ({ currentFilters }) => {
  // Получаем данные из React Query
  const { data: shiftReportsResponse } = useShiftReportsQuery({
    ...currentFilters,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const role = useSelector(getCurrentRole);

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
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
