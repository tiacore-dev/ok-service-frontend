import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { RoleId } from "../../../interfaces/roles/IRole";
import { DeleteOutlined } from "@ant-design/icons";

export const worksDesktopColumns = (
  navigate: NavigateFunction,
  role: RoleId,
): ColumnsType<IWorksListColumn> => [
  {
    title: "Наименование",
    dataIndex: "name",
    key: "name",
    width: "20%",
    render: (text: string, record: IWorksListColumn) => {
      if (role === RoleId.USER) {
        return <div>{record.name}</div>;
      }

      return (
        <div>
          {record.deleted && (
            <DeleteOutlined className="works__deleted-icon" />
          )}
          <a
            className="works__table__number"
            onClick={() => navigate && navigate(`/works/${record.key}`)}
          >
            {record.name}
          </a>
        </div>
      );
    },
  },
  {
    title: "Категория",
    dataIndex: "category",
    key: "category",
    width: "20%",
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
    title: "Цена 1",
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
    title: "Цена 2",
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
    title: "Цена 3",
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
    title: "Цена 4",
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
