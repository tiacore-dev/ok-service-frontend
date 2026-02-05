import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import type {
  MaterialsFiltersState,
  MaterialsSortField,
  MaterialsDeletedFilter,
} from "../../../interfaces/materials/IMaterialsFiltersState";

interface FiltersProps {
  filtersState: MaterialsFiltersState;
  onFiltersChange: (filters: MaterialsFiltersState) => void;
}

export const MaterialsFilters: React.FC<FiltersProps> = ({
  filtersState,
  onFiltersChange,
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

  const handleSortFieldChange = (value: MaterialsSortField) => {
    onFiltersChange({ ...filtersState, sortField: value });
  };

  const handleDeletedFilterChange = (value: MaterialsDeletedFilter) => {
    onFiltersChange({ ...filtersState, deletedFilter: value });
  };

  return (
    <Space
      className="materials_filters"
      direction={isMobile() ? "vertical" : "horizontal"}
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по названию"
        value={filtersState.search}
        onChange={handleSearchChange}
        className="materials_filters_input"
      />
      <Select
        className="materials_filters_select"
        value={filtersState.deletedFilter}
        onChange={handleDeletedFilterChange}
        options={[
          { label: "Не удалено", value: "active" },
          { label: "Удалено", value: "deleted" },
          { label: "Все", value: "all" },
        ]}
      />
      <Select
        className="materials_filters_sort"
        value={filtersState.sortField}
        onChange={handleSortFieldChange}
        options={[
          { label: "Сортировка: по названию", value: "name" },
          { label: "Сортировка: по ед. измерения", value: "measurement_unit" },
          { label: "Сортировка: по дате", value: "created_at" },
        ]}
      />

      <Button onClick={toggleSortOrder} icon={sortButtonIcon}>
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
    </Space>
  );
};
