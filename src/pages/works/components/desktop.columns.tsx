import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import { RoleId } from "../../../interfaces/roles/IRole";

export const worksDesktopColumns = (
  navigate: NavigateFunction,
  role: RoleId
): ColumnsType<IWorksListColumn> => [
    {
      title: "Наименование",
      dataIndex: "name",
      key: "name",
      width: "20%",

      render: (text: string, record: IWorksListColumn) => {
        if (role === RoleId.USER) {
          return (<div>{record.name}</div>)
        } else {
          return (<div>
            <a
              className="works__table__number"
              onClick={() => navigate && navigate(`/works/${record.key}`)}
            >
              {record.name}
            </a>
          </div>)
        }
      }
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
      width: "20%",
      render: (text: string, record: IWorksListColumn) => (
        <div>{record.measurement_unit}</div>
      ),
    }
  ];
