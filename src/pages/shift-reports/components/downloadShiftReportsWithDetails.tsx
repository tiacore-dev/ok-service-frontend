import { Button, Tooltip } from "antd";
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
import { IState } from "../../../store/modules";

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
  work: string;
  quantity: number;
  coast: number;
  sum: number;
  counter?: number;
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
    (state: IState) => state.pages.projectWorks.data
  );

  const exportToCSV = React.useCallback(async () => {
    try {
      setIsExporting(true);

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
      const uniqueDates = new Set(reportRows.map((row) => row.date));
      const totalDays = uniqueDates.size;

      let totalSum = 0;
      const reportHeaders = [
        "№",
        "Наименование оборудования",
        "кол-во ",
        "Цена за ед.",
        "Сумма",
      ];
      const mainHeaders = [
        "",
        "",
        "",
        "",
        "Утверждаю Генеральный директор",
        "\r\n",
        "",
        "",
        "",
        'ООО "Огнезащитная Корпорация"',
        "\r\n",
        dateTimestampToLocalString(currentFilters?.date_from) +
          " - " +
          dateTimestampToLocalString(currentFilters?.date_to),
        "",
        "",
        "___________________  Турков А.И",
        "\r\n",
        "\r\n",
        "",
        usersMap[currentFilters?.user]?.name || "",
        "\r\n",
      ];

      const allRows: ExportRow[] = [];
      let detailCounter = 0;

      for (const report of reportRows) {
        detailCounter = 0;
        allRows.push(report);
        totalSum += parseFloat(report.sum.replace(",", ".")) || 0;

        const reportId = shiftReportsData.find(
          (r: IShiftReport) => r.number === report.number
        )?.shift_report_id;

        if (reportId) {
          try {
            const detailsResponse = await fetchShiftReportDetails({
              shift_report: reportId,
            });
            const details = detailsResponse.shift_report_details || [];

            const currentProjectId = shiftReportsData.find(
              (r: IShiftReport) => r.shift_report_id === reportId
            )?.project;

            const projectWorksForCurrentProject = currentProjectId
              ? allProjectWorks.filter((el) => el.project === currentProjectId)
              : [];

            const projectWorksNameMap: Record<string, string> = {};
            projectWorksForCurrentProject.forEach((item) => {
              projectWorksNameMap[item.project_work_id] =
                item.project_work_name;
            });

            for (const detail of details) {
              detailCounter++;
              allRows.push({
                isDetail: true,
                work: worksMap[detail.work]?.name || "",
                quantity: detail.quantity,
                coast: detail.summ / detail.quantity,
                sum: detail.summ,
                counter: detailCounter,
              });
            }

            allRows.push({
              isDetail: true,
              work: "Всего:",
              quantity: 0,
              coast: 0,
              sum: parseFloat(report.sum.replace(",", ".")) || 0,
            });
          } catch (error) {
            console.error(
              `Ошибка при получении деталей для отчета ${reportId}:`,
              error
            );
          }
        }
      }

      let csvContent = "\uFEFF";
      csvContent += mainHeaders.join(";");
      csvContent += reportHeaders.join(";") + "\r\n";

      for (const row of allRows) {
        if ("isDetail" in row) {
          const values = [
            row.counter ? row.counter.toString() : "",
            row.work === "Всего:" ? "" : row.work,
            row.work === "Всего:" ? "Всего:" : row.quantity.toString(),
            row.work === "Всего:" ? "" : row.coast.toString(),
            row.sum.toString().replace(".", ","),
          ];
          csvContent +=
            values
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(";") + "\r\n";
        } else {
          const values = ["", row.object + " (" + row.project + ")"];
          csvContent +=
            values
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(";") + "\r\n";
        }
      }
      const endSum = ["", "Всего:", "", "", totalSum];
      csvContent = csvContent + endSum.join(";") + "\r\n";
      const endStat =
        "Отработанно по табелю с " +
        dateTimestampToLocalString(currentFilters?.date_from) +
        " по " +
        dateTimestampToLocalString(currentFilters?.date_to) +
        "  " +
        totalDays.toString() +
        " рабочих дней";
      csvContent += endStat + "\r\n";

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
  }, [
    shiftReportsData,
    projectsMap,
    objectsMap,
    usersMap,
    worksMap,
    allProjectWorks,
  ]);

  const isDisabled =
    shiftReportsData.length === 0 ||
    !currentFilters?.date_from ||
    !currentFilters?.date_to ||
    !currentFilters?.user;

  const button = (
    <Button
      icon={<FileExcelOutlined />}
      onClick={exportToCSV}
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
