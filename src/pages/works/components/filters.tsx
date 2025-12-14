import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import type {
  WorksFiltersState,
  WorksSortField,
  WorksDeletedFilter,
} from "../../../interfaces/works/IWorksFiltersState";

interface FiltersProps {
  filtersState: WorksFiltersState;
  onFiltersChange: (filters: WorksFiltersState) => void;
  workCategoriesOptions: Array<{ label: string; value: string }>;
}

export const WorksFilters: React.FC<FiltersProps> = ({
  filtersState,
  onFiltersChange,
  workCategoriesOptions,
}) => {
  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? (
      <ArrowUpOutlined />
    ) : (
      <ArrowDownOutlined />
    );

  const toggleSortOrder = () =>
    onFiltersChange({
      ...filtersState,
      sortOrder: filtersState.sortOrder === "ascend" ? "descend" : "ascend",
    });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filtersState, search: event.target.value });
  };

  const handleCategoryChange = (value: string | undefined) => {
    onFiltersChange({ ...filtersState, categoryId: value });
  };

  const handleSortFieldChange = (value: WorksSortField) => {
    onFiltersChange({ ...filtersState, sortField: value });
  };

  const handleDeletedFilterChange = (value: WorksDeletedFilter) => {
    onFiltersChange({ ...filtersState, deletedFilter: value });
  };

  return (
    <Space
      className="works_filters"
      direction={isMobile() ? "vertical" : "horizontal"}
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по названию"
        value={filtersState.search}
        onChange={handleSearchChange}
        className="works_filters_input"
      />
      <Select
        allowClear
        className="works_filters_select"
        options={workCategoriesOptions}
        placeholder="Категория"
        value={filtersState.categoryId}
        onChange={handleCategoryChange}
      />
      <Select
        className="works_filters_select"
        value={filtersState.deletedFilter}
        onChange={handleDeletedFilterChange}
        options={[
          { label: "Не удалено", value: "active" },
          { label: "Удалено", value: "deleted" },
          { label: "Все", value: "all" },
        ]}
      />
      <Select
        className="works_filters_sort"
        value={filtersState.sortField}
        onChange={handleSortFieldChange}
        options={[
          { label: "Сортировка: по названию", value: "name" },
          { label: "Сортировка: по категории", value: "category" },
          { label: "Сортировка: по цене 1", value: "price1" },
          { label: "Сортировка: по цене 2", value: "price2" },
          { label: "Сортировка: по цене 3", value: "price3" },
          { label: "Сортировка: по цене 4", value: "price4" },
        ]}
      />

      <Button onClick={toggleSortOrder} icon={sortButtonIcon}>
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
    </Space>
  );
};
