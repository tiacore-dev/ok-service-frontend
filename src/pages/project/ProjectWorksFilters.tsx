import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import type {
  IProjectWorksFiltersState,
  ProjectWorksSortField,
  ProjectWorksSignedFilter,
} from "../../interfaces/projectWorks/IProjectWorksFiltersState";

interface ProjectWorksFiltersProps {
  filtersState: IProjectWorksFiltersState;
  onFiltersChange: (filters: IProjectWorksFiltersState) => void;
  workOptions: Array<{ label: string; value: string }>;
}

const signedOptions: Array<{ label: string; value: ProjectWorksSignedFilter }> = [
  { label: "Все записи", value: "all" },
  { label: "Подписанные", value: "signed" },
  { label: "Неподписанные", value: "unsigned" },
];

const sortOptions: Array<{ label: string; value: ProjectWorksSortField }> = [
  { label: "Сортировка: по названию", value: "name" },
  { label: "Сортировка: по количеству", value: "quantity" },
];

export const ProjectWorksFilters: React.FC<ProjectWorksFiltersProps> = ({
  filtersState,
  onFiltersChange,
  workOptions,
}) => {
  const changeFilters = (patch: Partial<IProjectWorksFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Space
      className="project-works_filters"
      direction={isMobile() ? "vertical" : "horizontal"}
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по названию или работе"
        value={filtersState.search}
        onChange={(event) => changeFilters({ search: event.target.value })}
        className="project-works_filters_input"
      />
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        className="project-works_filters_select"
        placeholder="Работа"
        value={filtersState.workId}
        onChange={(value) => changeFilters({ workId: value || undefined })}
        options={workOptions}
      />
      <Select
        className="project-works_filters_select"
        value={filtersState.signed}
        onChange={(value: ProjectWorksSignedFilter) => changeFilters({ signed: value })}
        options={signedOptions}
      />
      <Select
        className="project-works_filters_select"
        value={filtersState.sortField}
        onChange={(value: ProjectWorksSortField) => changeFilters({ sortField: value })}
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
    </Space>
  );
};
