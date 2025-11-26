import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { EditableObjectDialog } from "../../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import type { IObjectsFiltersState, ObjectsSortField } from "../../../interfaces/objects/IObjectsFiltersState";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";
import { isMobile } from "../../../utils/isMobile";

interface ObjectsFiltersProps {
  filtersState: IObjectsFiltersState;
  onFiltersChange: (filters: IObjectsFiltersState) => void;
  statusOptions: Array<{ label: string; value: string }>;
  cityOptions: Array<{ label: string; value: string }>;
  managerOptions: Array<{ label: string; value: string }>;
}

export const Filters: React.FC<ObjectsFiltersProps> = ({
  filtersState,
  onFiltersChange,
  statusOptions,
  cityOptions,
  managerOptions,
}) => {
  const currentRole = useSelector(getCurrentRole);
  const changeFilters = (patch: Partial<IObjectsFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="objects_filters"
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по названию, адресу или описанию"
        value={filtersState.search}
        onChange={(event) => changeFilters({ search: event.target.value })}
        className="objects_filters_input"
      />
      <Select
        allowClear
        className="objects_filters_select"
        placeholder="Статус"
        value={filtersState.statusId}
        onChange={(value) => changeFilters({ statusId: value || undefined })}
        options={statusOptions}
      />
      <Select
        allowClear
        className="objects_filters_select"
        placeholder="Город"
        value={filtersState.cityId}
        onChange={(value) => changeFilters({ cityId: value || undefined })}
        options={cityOptions}
      />
      <Select
        allowClear
        className="objects_filters_select"
        placeholder="Прораб"
        value={filtersState.managerId}
        onChange={(value) => changeFilters({ managerId: value || undefined })}
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={managerOptions}
      />
      <Select
        className="objects_filters_sort"
        value={filtersState.sortField}
        onChange={(value: ObjectsSortField) => changeFilters({ sortField: value })}
        options={[
          { label: "Сортировка: по названию", value: "name" },
          { label: "Сортировка: по городу", value: "city" },
          { label: "Сортировка: по статусу", value: "status" },
          { label: "Сортировка: по прорабу", value: "manager" },
        ]}
      />
      <Button
        onClick={() =>
          changeFilters({
            sortOrder: filtersState.sortOrder === "ascend" ? "descend" : "ascend",
          })
        }
        icon={sortButtonIcon}
      >
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
      {currentRole === RoleId.ADMIN && <EditableObjectDialog />}
    </Space>
  );
};
