import * as React from "react";
import { ColumnsType, ColumnType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IProjectsListColumn } from "../../../../interfaces/projects/IProjectsList";
import { IUser } from "../../../../interfaces/users/IUser";
import { IProjectsSettingsState } from "../../../../store/modules/settings/projects";
import { filterDropdown } from "../../../../components/Table/filterDropdown";

interface IProjectsListColumns extends ColumnType<IProjectsListColumn> {
  key: string;
}

export const projectsDesktopColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
  tableState: IProjectsSettingsState,
): ColumnsType<IProjectsListColumn> => {
  const collumns: ColumnsType<IProjectsListColumn> = [
    {
      title: "Спецификация",
      dataIndex: "name",
      key: "name",
      width: "20%",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      render: (text: string, record: IProjectsListColumn) => (
        <div>
          <a
            className="projects__table__number"
            onClick={() => navigate && navigate(`/projects/${record.key}`)}
          >
            {record.name}
          </a>
        </div>
      ),
    },
    {
      title: "Прораб",
      dataIndex: "project_leader",
      key: "project_leader",
      width: "20%",
      filterDropdown: filterDropdown,
      onFilter: (value, record) =>
        usersMap[record.project_leader]?.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        usersMap[a.project_leader]?.name > usersMap[b.project_leader]?.name
          ? 1
          : -1,
      render: (text: string, record: IProjectsListColumn) => (
        <div>
          <div>{usersMap[record.project_leader]?.name}</div>
        </div>
      ),
    },
  ];

  return collumns.map((collumn: IProjectsListColumns) => ({
    ...collumn,
    filteredValue: tableState?.filters && tableState.filters[collumn.key],
    sortOrder:
      tableState?.sorter?.field === collumn.key
        ? tableState.sorter.order
        : null,
  }));
};
