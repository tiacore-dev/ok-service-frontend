import { Button, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { FileExcelOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { dateTimestampToLocalString } from "../../utils/dateConverter";
// import { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { useShiftReportQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import { useShiftReportDetailsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.query";
import { getWorksMap } from "../../store/modules/pages/selectors/works.selector";
import { getProjectWorksByProjectId } from "../../store/modules/pages/selectors/project-works.selector";
import { IState } from "../../store/modules";

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

interface IExportedDetailsData {
  project_work: string;
  work: string;
  quantity: number;
  sum: number;
}

interface DownloadProps {
  shiftId: string;
  summ?: number;
}

export const DownloadShiftReport: React.FC<DownloadProps> = ({
  shiftId,
  summ,
}) => {
  const { data: shiftReportData } = useShiftReportQuery(shiftId);
  const { data: shiftReportDetailsData } = useShiftReportDetailsQuery(shiftId);

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const worksMap = useSelector(getWorksMap);
  const projectWorksData = useSelector((state: IState) =>
    getProjectWorksByProjectId(state, shiftReportData?.project)
  );

  // Создаем маппинг project_work_id -> project_work_name
  const projectWorksNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    projectWorksData.forEach((item) => {
      map[item.project_work_id] = item.project_work_name;
    });
    return map;
  }, [projectWorksData]);

  const exportedData: IExportedData[] = React.useMemo(() => {
    if (!shiftReportData) return [];

    return [
      {
        number: shiftReportData.number,
        date: dateTimestampToLocalString(shiftReportData.date),
        user: usersMap[shiftReportData.user]?.name || "",
        object:
          objectsMap[projectsMap[shiftReportData.project]?.object]?.name || "",
        project: projectsMap[shiftReportData.project]?.name || "",
        project_leader:
          usersMap[projectsMap[shiftReportData.project]?.project_leader]
            ?.name || "",
        sum: summ ? summ.toString().replace(".", ",") : "0",
        signed: shiftReportData.signed ? "Да" : "Нет",
      },
    ];
  }, [shiftReportData, projectsMap, objectsMap, usersMap, summ]);

  const exportedDetailsData: IExportedDetailsData[] = React.useMemo(() => {
    if (!shiftReportDetailsData) return [];

    return shiftReportDetailsData.map((detail) => ({
      project_work: projectWorksNameMap[detail.project_work] || "",
      work: worksMap[detail.work]?.name || "",
      quantity: detail.quantity,
      sum: detail.summ,
    }));
  }, [shiftReportDetailsData, worksMap, projectWorksNameMap]);

  const exportToCSV = React.useCallback(() => {
    if (!shiftReportData) return;

    // Основные данные отчета
    const mainHeaders = [
      "Номер",
      "Дата",
      "Исполнитель",
      "Объект",
      "Спецификация",
      "Прораб",
      "Сумма",
      "Согласовано",
    ].join(";");

    const mainRows = exportedData
      .map((obj) =>
        Object.values(obj)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\r\n");

    // Детализированные данные
    const detailsHeaders = [
      "Наименование",
      "Работа",
      "Количество",
      "Сумма",
    ].join(";");

    const detailsRows = exportedDetailsData
      .map((detail) =>
        [detail.project_work, detail.work, detail.quantity, detail.sum]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\r\n");

    // Объединяем все части CSV
    const csvContent =
      "\uFEFF" +
      mainHeaders +
      "\r\n" +
      mainRows +
      "\r\n" +
      detailsHeaders +
      "\r\n" +
      detailsRows;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `report_${shiftReportData.number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportedData, exportedDetailsData, shiftReportData]);

  return (
    <div className="shift-reports_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <Button
          icon={<FileExcelOutlined />}
          onClick={exportToCSV}
          disabled={!shiftReportData}
        >
          Скачать отчет смены
        </Button>
      </Space>
    </div>
  );
};
