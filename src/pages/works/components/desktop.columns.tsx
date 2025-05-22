import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { RoleId } from "../../../interfaces/roles/IRole";
import { filterDropdown } from "../../../components/Table/filterDropdown";
import { DeleteOutlined } from "@ant-design/icons";

export const worksDesktopColumns = (
  navigate: NavigateFunction,
  role: RoleId,
  workCategoriesOptions?: { text: string; value: string }[],
  tableState?: any
): ColumnsType<IWorksListColumn> => {
  const columns: Array<any> = [
    {
      title: "Наименование",
      dataIndex: "name",
      key: "name",
      width: "20%",
      filterDropdown: filterDropdown,
      onFilter: (value: string | number | boolean, record: IWorksListColumn) =>
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
      sorter: (a: IWorksListColumn, b: IWorksListColumn) =>
        a.name > b.name ? 1 : -1,
      render: (text: string, record: IWorksListColumn) => {
        if (role === RoleId.USER) {
          return <div>{record.name}</div>;
        } else {
          return (
            <div>
              {record.deleted && (
                <DeleteOutlined style={{ marginRight: "8px" }} />
              )}
              <a
                className="works__table__number"
                onClick={() => navigate && navigate(`/works/${record.key}`)}
              >
                {record.name}
              </a>
            </div>
          );
        }
      },
    },
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      width: "20%",
      filters: workCategoriesOptions,
      filterSearch: true,
      onFilter: (value: string | number | boolean, record: IWorksListColumn) =>
        record.category.work_category_id === value,
      sorter: (a: IWorksListColumn, b: IWorksListColumn) =>
        a.category.name > b.category.name ? 1 : -1,
      render: (text: string, record: IWorksListColumn) => (
        <div>{record.category.name}</div>
      ),
    },
    {
      title: "Единица измерения",
      dataIndex: "measurement_unit",
      key: "measurement_unit",
      width: "15%",
      render: (text: string, record: IWorksListColumn) => (
        <div>{record.measurement_unit}</div>
      ),
    },
    {
      title: "Разряд 1",
      key: "category1",
      width: "10%",
      render: (text: string, record: IWorksListColumn) => (
        <div>
          {record.work_prices?.find((price) => price.category === 1)?.price
            ? `${record.work_prices.find((price) => price.category === 1)!.price} руб.`
            : "-"}
        </div>
      ),
    },
    {
      title: "Разряд 2",
      key: "category2",
      width: "10%",
      render: (text: string, record: IWorksListColumn) => (
        <div>
          {record.work_prices?.find((price) => price.category === 2)?.price
            ? `${record.work_prices.find((price) => price.category === 2)!.price} руб.`
            : "-"}
        </div>
      ),
    },
    {
      title: "Разряд 3",
      key: "category3",
      width: "10%",
      render: (text: string, record: IWorksListColumn) => (
        <div>
          {record.work_prices?.find((price) => price.category === 3)?.price
            ? `${record.work_prices.find((price) => price.category === 3)!.price} руб.`
            : "-"}
        </div>
      ),
    },
    {
      title: "Разряд 4",
      key: "category4",
      width: "10%",
      render: (text: string, record: IWorksListColumn) => (
        <div>
          {record.work_prices?.find((price) => price.category === 4)?.price
            ? `${record.work_prices.find((price) => price.category === 4)!.price} руб.`
            : "-"}
        </div>
      ),
    },
  ];

  return columns.map((column) => ({
    ...column,
    filteredValue: tableState?.filters && tableState.filters[column.key],
    sortOrder:
      tableState?.sorter?.field === column.key ? tableState.sorter.order : null,
  }));
};
