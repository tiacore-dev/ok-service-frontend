import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { Space } from "antd";
import { ICitiesListColumn } from "../../../interfaces/cities/ICitiesList";
import { IUser } from "../../../interfaces/users/IUser";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { EditableCityDialog } from "../../../components/ActionDialogs/EditableCityDialog/EditableCityDialog";
import { DeleteCityDialog } from "../../../components/ActionDialogs/DeleteCityDialog";
import { ICitiesSettingsState } from "../../../store/modules/settings/cities";

export const citiesDesktopColumns = (
  usersMap: Record<string, IUser>,
  onDelete: (cityId: string, cityName: string) => void,
  canManage: boolean,
  tableState?: ICitiesSettingsState,
): ColumnsType<ICitiesListColumn> => {
  const columns: ColumnsType<ICitiesListColumn> = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      width: "30%",
      filterDropdown,
      onFilter: (value, record) =>
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record) => <div>{record.name}</div>,
    },
    {
      title: "Создатель",
      dataIndex: "created_by",
      key: "created_by",
      width: "20%",
      filterDropdown,
      onFilter: (value, record) =>
        (usersMap[record.created_by ?? ""]?.name ?? "")
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a, b) =>
        (usersMap[a.created_by ?? ""]?.name ?? "").localeCompare(
          usersMap[b.created_by ?? ""]?.name ?? "",
        ),
      render: (_, record) => (
        <div>{usersMap[record.created_by ?? ""]?.name ?? "—"}</div>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      title: "",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <EditableCityDialog city={record} iconOnly />
          <DeleteCityDialog
            name={record.name}
            onDelete={() => onDelete(record.city_id, record.name)}
          />
        </Space>
      ),
    });
  }

  return columns.map((column) => {
    const key =
      typeof column.key === "string" ? column.key : column.key?.toString();
    const sorterField =
      typeof tableState?.sorter?.field === "string"
        ? tableState.sorter.field
        : tableState?.sorter?.field?.toString();

    return {
      ...column,
      filteredValue:
        tableState?.filters && key
          ? tableState.filters[key]
          : column.filteredValue,
      sortOrder:
        key && sorterField === key
          ? tableState?.sorter?.order
          : column.sortOrder ?? null,
    };
  });
};
