import { ArrowDownOutlined, ArrowUpOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EditableWorkDialog } from "../../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { isMobile } from "../../../utils/isMobile";
import type { IWorksList } from "../../../interfaces/works/IWorksList";
import type {
  WorksFiltersState,
  WorksSortField,
  WorksDeletedFilter,
} from "../../../interfaces/works/IWorksFiltersState";

interface FiltersProps {
  works: IWorksList[];
  filtersState: WorksFiltersState;
  onFiltersChange: (filters: WorksFiltersState) => void;
  workCategoriesOptions: Array<{ label: string; value: string }>;
}

export const Filters: React.FC<FiltersProps> = ({
  works,
  filtersState,
  onFiltersChange,
  workCategoriesOptions,
}) => {
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);

  const exportedData = React.useMemo(() => {
    const activeWorks = works.filter((work) => !work.deleted);
    const formatPrice = (work: IWorksList, category: number) => {
      const price = work.work_prices?.find((item) => item.category === category)
        ?.price;
      return typeof price === "number" ? price.toString().replace(".", ",") : "";
    };

    return activeWorks.map((work) => ({
      id: work.work_id ?? "",
      name: work.name ?? "",
      category: work.category?.name ?? "",
      measurement_unit: work.measurement_unit ?? "",
      price1: formatPrice(work, 1),
      price2: formatPrice(work, 2),
      price3: formatPrice(work, 3),
      price4: formatPrice(work, 4),
    }));
  }, [works]);

  const handleExport = React.useCallback(() => {
    if (!exportedData.length) {
      return;
    }

    const headers = [
      "id",
      "Наименование",
      "Категория",
      "Единица измерения",
      "Цена 1",
      "Цена 2",
      "Цена 3",
      "Цена 4",
    ].join(";");

    const rows = exportedData
      .map((row) =>
        [
          row.id,
          row.name,
          row.category,
          row.measurement_unit,
          row.price1,
          row.price2,
          row.price3,
          row.price4,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\r\n");

    const csvContent = "\uFEFF" + headers + "\r\n" + rows;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "works.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportedData]);

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

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
      <Button onClick={toggleSortOrder} icon={sortButtonIcon}>
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
      <Button
        onClick={() => {
          navigate("categories");
        }}
      >
        Категории
      </Button>
      <Button
        icon={<FileExcelOutlined />}
        onClick={handleExport}
        disabled={!exportedData.length}
      >
        Экспорт CSV
      </Button>
      {currentRole === RoleId.ADMIN && <EditableWorkDialog />}
    </Space>
  );
};
