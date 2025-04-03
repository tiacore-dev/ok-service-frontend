import { Button, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import { EditableShiftReportDialog } from "../../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { useSelector } from "react-redux";
import { IShiftReportsList } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IState } from "../../../store/modules";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { FileExcelOutlined } from "@ant-design/icons";

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

export const Filters = () => {
  const shiftReportsData: IShiftReportsList[] = useSelector(
    (state: IState) => state.pages.shiftReports.data,
  );

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);

  const exportedData: IExportedData[] = React.useMemo(
    () =>
      shiftReportsData.map((el) => ({
        number: el.number,
        date: dateTimestampToLocalString(el.date),
        user: usersMap[el.user].name,
        object: objectsMap[projectsMap[el.project].object].name,
        project: projectsMap[el.project].name,
        project_leader: usersMap[projectsMap[el.project].project_leader].name,
        sum: el.shift_report_details_sum.toString().replace(".", ","),
        signed: el.signed ? "Да" : "Нет",
      })),
    [shiftReportsData, projectsMap, objectsMap, usersMap],
  );

  const exportToCSV = React.useCallback(
    (data: IExportedData[], filename = "data.csv") => {
      // Преобразование массива объектов в CSV-строку
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
        .join("\r\n"); // Используем \r\n для совместимости с Windows

      // Добавляем BOM (Byte Order Mark) для правильной кодировки UTF-8
      const csvContent = "\uFEFF" + headers + "\r\n" + rows;

      // Создание Blob с указанием кодировки
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
    <div className="shift-reports_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <EditableShiftReportDialog />
        <Button
          icon={<FileExcelOutlined />}
          onClick={() => exportToCSV(exportedData, "report.csv")}
        >
          Скачать отчет
        </Button>
      </Space>
    </div>
  );
};
