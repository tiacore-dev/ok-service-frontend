import * as React from "react";
import { ColumnsType, ColumnType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IUser } from "../../../interfaces/users/IUser";
import {
  dateTimestampToLocalString,
  formatDate,
} from "../../../utils/dateConverter";
import { Checkbox } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { dateFilterDropdown } from "../../../components/Table/dateFilterDropdown";
import { IShiftReportsSettingsState } from "../../../store/modules/settings/shift-reports";

interface IShiftReportsListColumns extends ColumnType<IShiftReportsListColumn> {
  key: string
}

export const shiftReportsDesktopColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>,
  tableState: IShiftReportsSettingsState
): ColumnsType<IShiftReportsListColumn> => {
  const collumns: ColumnsType<IShiftReportsListColumn> = [
    {
      title: "Номер",
      dataIndex: "number",
      key: "number",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        record.number.toString().padStart(5, "0").includes(value.toString()),
      sorter: (a, b) => a.number - b.number,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <a
            className="shift-reports__table__number"
            onClick={() => navigate && navigate(`/shifts/${record.key}`)}
          >
            {record.number?.toString().padStart(5, "0")}
          </a>
        </div>
      ),
    },

    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      filterDropdown: dateFilterDropdown, // Используем компонент для фильтрации по датам
      onFilter: (value, record) => {
        return value === formatDate(new Date(record.date));
      },
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{dateTimestampToLocalString(record.date)}</div>
      ),
    },
    {
      title: "Исполнитель",
      dataIndex: "user",
      key: "user",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        usersMap[record.user]?.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        usersMap[a.user]?.name > usersMap[b.user]?.name ? 1 : -1,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{usersMap[record.user]?.name}</div>
      ),
    },
    {
      title: "Спецификация",
      dataIndex: "project",
      key: "project",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        projectMap[record.project]?.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        projectMap[a.project]?.name > projectMap[b.project]?.name ? 1 : -1,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <div>{projectMap[record.project]?.name}</div>
        </div>
      ),
    },
    {
      title: "Прораб",
      dataIndex: "project_leader",
      key: "project_leader",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        usersMap[projectMap[record.project]?.project_leader]?.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        usersMap[projectMap[a.project]?.project_leader]?.name >
        usersMap[projectMap[b.project]?.project_leader]?.name
          ? 1
          : -1,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <div>
            {usersMap[projectMap[record.project]?.project_leader]?.name}
          </div>
        </div>
      ),
    },
    {
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
      sorter: (a, b) => a.shift_report_details_sum - b.shift_report_details_sum,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{record.shift_report_details_sum}</div>
      ),
    },
    {
      title: "Согласовано",
      dataIndex: "signed",
      key: "signed",
      sorter: (a, b) => (a.signed ? 1 : 0) - (b.signed ? 1 : 0),
      filters: [
        { text: "Да", value: true },
        { text: "Нет", value: false },
      ],
      onFilter: (value, record) => record.signed === value,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <Checkbox checked={!!record.signed} />
        </div>
      ),
    },
  ];

  return collumns.map((collumn: IShiftReportsListColumns) => ({...collumn, filteredValue: tableState?.filters && tableState.filters[collumn.key],
    sortOrder: tableState?.sorter?.field === collumn.key ? tableState.sorter.order : null}))
};
