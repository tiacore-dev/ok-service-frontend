import { Button, Tooltip } from "antd";
import * as React from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
// import type { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import { useShiftReportsQuery } from "../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { getWorksMap } from "../../../store/modules/pages/selectors/works.selector";
import { fetchShiftReportDetails } from "../../../api/shift-report-details.api";
import { IState } from "../../../store/modules";
import { generateDocument } from "../../../api/download.api";

// interface IExportedReportData {
//   number: number;
//   date: string;
//   user: string;
//   object: string;
//   project: string;
//   project_leader: string;
//   sum: string;
//   signed: string;
// }

// interface IExportedDetailData {
//   isDetail: boolean;
//   work: string;
//   quantity: number;
//   coast: number;
//   sum: number;
//   counter?: number;
// }

// type ExportRow = IExportedReportData | IExportedDetailData;

interface DownloadShiftReportsWithDetailsProps {
  currentFilters?: {
    user?: string;
    project?: string;
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
  work: string;
  quantity: number;
  coast: number;
  detail_summ: number;
}

export const DownloadShiftReportsWithDetails: React.FC<
  DownloadShiftReportsWithDetailsProps
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
  const usersMap = useSelector(getUsersMap);
  const worksMap = useSelector(getWorksMap);

  const allProjectWorks = useSelector(
    (state: IState) => state.pages.projectWorks.data,
  );

  const createExportTemplate = async (): Promise<ExportExcelTemplate> => {
    const exportData: ExportExcelTemplate = {
      date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
      date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
      user: usersMap[currentFilters?.user]?.name || "",
      total_summ: 0,
      unique_days: 0,
      objects: [],
    };

    const uniqueDatesWithDetails = new Set<string>();

    const objectsMapByProject: Record<string, ExportExcelObject> = {};

    for (const report of shiftReportsData) {
      if (!report.shift_report_id) continue;

      try {
        const detailsResponse = await fetchShiftReportDetails({
          shift_report: report.shift_report_id,
        });
        const details = detailsResponse.shift_report_details || [];

        if (details.length === 0) continue;

        const reportDate = dateTimestampToLocalString(report.date);
        uniqueDatesWithDetails.add(reportDate);

        const objectName =
          objectsMap[projectsMap[report.project]?.object]?.name || "";
        const projectName = projectsMap[report.project]?.name || "";
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

        details.forEach(
          (detail: { work: string; quantity: number; summ: number }) => {
            existingObject?.details.push({
              work: `${worksMap[detail.work]?.name || ""} (${reportDate})`,
              quantity: detail.quantity,
              coast: detail.summ / detail.quantity,
              detail_summ: detail.summ,
            });
          },
        );
      } catch (error) {
        console.error(
          `Ошибка при получении деталей для отчета ${report.shift_report_id}:`,
          error,
        );
      }
    }

    exportData.unique_days = uniqueDatesWithDetails.size;
    return exportData;
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
      const exportTemplate = await createExportTemplate();

      const userName = usersMap[currentFilters?.user]?.name || "unknown";
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
    shiftReportsData,
    projectsMap,
    objectsMap,
    usersMap,
    worksMap,
    allProjectWorks,
    currentFilters?.date_from,
    currentFilters?.date_to,
    currentFilters?.user,
  ]);

  const isDisabled =
    shiftReportsData.length === 0 ||
    !currentFilters?.date_from ||
    !currentFilters?.date_to ||
    !currentFilters?.user;

  const button = (
    <Button
      icon={<FileExcelOutlined />}
      onClick={exportToXLSX}
      loading={isExporting}
      disabled={isDisabled}
    >
      Скачать детализированный отчет
    </Button>
  );

  return isDisabled ? (
    <Tooltip title="Для скачивания отчета необходимо выбрать фильтры по дате и пользователю">
      {button}
    </Tooltip>
  ) : (
    button
  );
};
