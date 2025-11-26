import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { EditableProjectDialog } from "../../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import type {
  IObjectProjectsFiltersState,
  ObjectProjectsSortField,
} from "../../../interfaces/projects/IObjectProjectsFiltersState";
import { isMobile } from "../../../utils/isMobile";

interface ObjectProjectsFiltersProps {
  filtersState: IObjectProjectsFiltersState;
  onFiltersChange: (filters: IObjectProjectsFiltersState) => void;
  leadersOptions: Array<{ label: string; value: string }>;
  canCreate: boolean;
  objectId: string;
}

const sortOptions: Array<{ label: string; value: ObjectProjectsSortField }> = [
  { label: "Сортировка: по названию", value: "name" },
  { label: "Сортировка: по прорабу", value: "leader" },
];

export const ObjectProjectsFilters: React.FC<ObjectProjectsFiltersProps> = ({
  filtersState,
  onFiltersChange,
  leadersOptions,
  canCreate,
  objectId,
}) => {
  const changeFilters = (patch: Partial<IObjectProjectsFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="projects_filters"
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по названию или прорабу"
        value={filtersState.search}
        onChange={(event) => changeFilters({ search: event.target.value })}
        className="projects_filters_input"
      />
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        className="projects_filters_select"
        placeholder="Прораб"
        value={filtersState.leaderId}
        onChange={(value) => changeFilters({ leaderId: value || undefined })}
        options={leadersOptions}
      />
      <Select
        className="projects_filters_select"
        value={filtersState.sortField}
        onChange={(value: ObjectProjectsSortField) => changeFilters({ sortField: value })}
        options={sortOptions}
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
      {canCreate && <EditableProjectDialog objectId={objectId} />}
    </Space>
  );
};
