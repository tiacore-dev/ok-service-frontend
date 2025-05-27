import * as React from "react";
import { ColumnsType, ColumnType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IUser } from "../../../interfaces/users/IUser";
import {
  dateTimestampToLocalString,
  formatDate,
} from "../../../utils/dateConverter";
import { Button, Checkbox, DatePicker, Select } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";
import { IShiftReportsSettingsState } from "../../../store/modules/settings/shift-reports";
import { IObject } from "../../../interfaces/objects/IObject";
import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface IShiftReportsListColumns extends ColumnType<IShiftReportsListColumn> {
  key: string;
}

export const shiftReportsDesktopColumns = (
  navigate: NavigateFunction,
  projectMap: Record<string, IProject>,
  usersMap: Record<string, IUser>,
  tableState: IShiftReportsSettingsState,
  objectsMap: Record<string, IObject>,
  onFilterChange?: (field: string, value: any) => void,
  filters?: {
    user?: string;
    project?: string;
    date_from?: number;
    date_to?: number;
  }
): ColumnsType<IShiftReportsListColumn> => {
  const columns: ColumnsType<IShiftReportsListColumn> = [
    {
      title: "Номер",
      dataIndex: "number",
      key: "number",
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
      sorter: true,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{dateTimestampToLocalString(record.date)}</div>
      ),
      filteredValue:
        tableState?.filters?.date_from || tableState?.filters?.date_to
          ? [tableState.filters.date_from?.[0], tableState.filters.date_to?.[0]]
          : null,
      filterIcon: <CalendarOutlined />,
      filterDropdown: ({ confirm }) => {
        const [dateFrom, setDateFrom] = React.useState<dayjs.Dayjs | null>(
          filters?.date_from ? dayjs(filters.date_from) : null
        );
        const [dateTo, setDateTo] = React.useState<dayjs.Dayjs | null>(
          filters?.date_to ? dayjs(filters.date_to) : null
        );

        const handleDateFromChange = (date: dayjs.Dayjs | null) => {
          setDateFrom(date);
          onFilterChange?.(
            "date_from",
            date ? date.startOf("day").valueOf() : undefined
          );

          if (date && dateTo && date.isAfter(dateTo)) {
            setDateTo(null);
            onFilterChange?.("date_to", undefined);
          }
        };

        const handleDateToChange = (date: dayjs.Dayjs | null) => {
          setDateTo(date);
          onFilterChange?.(
            "date_to",
            date ? date.endOf("day").valueOf() : undefined
          );
        };

        const handleReset = () => {
          setDateFrom(null);
          setDateTo(null);
          onFilterChange?.("date_from", undefined);
          onFilterChange?.("date_to", undefined);
          confirm();
        };

        return (
          <div style={{ padding: 8 }}>
            <div>
              <DatePicker
                placeholder="Дата от"
                allowClear
                format="DD.MM.YYYY"
                onChange={handleDateFromChange}
                value={dateFrom}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <DatePicker
                placeholder="Дата до"
                allowClear
                format="DD.MM.YYYY"
                onChange={handleDateToChange}
                value={dateTo}
                disabledDate={(current) => {
                  if (!dateFrom) return false;
                  return current && current < dateFrom.startOf("day");
                }}
              />
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button type="link" size="small" onClick={handleReset}>
                Сбросить
              </Button>
              <Button type="primary" size="small" onClick={() => confirm()}>
                OK
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Исполнитель",
      dataIndex: "user",
      key: "user",
      sorter: true,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{usersMap[record.user]?.name}</div>
      ),
      filteredValue: tableState?.filters?.user || null,
      filterIcon: <SearchOutlined />,
      filterDropdown: ({ confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Выберите исполнителя"
            allowClear
            showSearch
            options={Object.values(usersMap).map((user) => ({
              value: user.user_id,
              label: user.name,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              onFilterChange?.("user", value);
              confirm();
            }}
            value={filters?.user}
          />
        </div>
      ),
    },
    {
      title: "Объект",
      dataIndex: "object",
      key: "object",
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <div>{objectsMap[projectMap[record.project]?.object]?.name}</div>
        </div>
      ),
    },
    {
      title: "Спецификация",
      dataIndex: "project",
      key: "project",
      sorter: true,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <div>{projectMap[record.project]?.name}</div>
        </div>
      ),
      filteredValue: tableState?.filters?.project || null,
      filterIcon: <SearchOutlined />,
      filterDropdown: ({ confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Выберите спецификацию"
            allowClear
            showSearch
            options={Object.values(projectMap).map((project) => ({
              value: project.project_id,
              label: project.name,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              onFilterChange?.("project", value);
              confirm();
            }}
            value={filters?.project}
          />
        </div>
      ),
    },
    {
      title: "Прораб",
      dataIndex: "project_leader",
      key: "project_leader",
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
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>{record.shift_report_details_sum}</div>
      ),
    },
    {
      title: "Согласовано",
      dataIndex: "signed",
      key: "signed",
      sorter: true,
      render: (text: string, record: IShiftReportsListColumn) => (
        <div>
          <Checkbox checked={!!record.signed} />
        </div>
      ),
    },
  ];

  return columns.map((column: IShiftReportsListColumns) => ({
    ...column,
    sortOrder:
      tableState?.sorter?.field === column.key ? tableState.sorter.order : null,
  }));
};
