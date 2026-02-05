import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IMaterialsListColumn } from "../../../interfaces/materials/IMaterialsList";
import { RoleId } from "../../../interfaces/roles/IRole";
import { DeleteOutlined } from "@ant-design/icons";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";

export const materialsDesktopColumns = (
  navigate: NavigateFunction,
  role: RoleId,
): ColumnsType<IMaterialsListColumn> => [
  {
    title: "Наименование",
    dataIndex: "name",
    key: "name",
    width: "40%",
    render: (_text: string, record: IMaterialsListColumn) => {
      if (role === RoleId.USER) {
        return (
          <div>
            {record.deleted && (
              <DeleteOutlined style={{ marginRight: "8px" }} />
            )}
            {record.name}
          </div>
        );
      }

      return (
        <div>
          {record.deleted && <DeleteOutlined style={{ marginRight: "8px" }} />}
          <a
            className="materials__table__number"
            onClick={() => navigate && navigate(`/materials/${record.key}`)}
          >
            {record.name}
          </a>
        </div>
      );
    },
  },
  {
    title: "Единица измерения",
    dataIndex: "measurement_unit",
    key: "measurement_unit",
    width: "20%",
    render: (_text: string, record: IMaterialsListColumn) => (
      <div>{record.measurement_unit}</div>
    ),
  },
  {
    title: "Дата создания",
    dataIndex: "created_at",
    key: "created_at",
    width: "20%",
    render: (_text: string, record: IMaterialsListColumn) => (
      <div>
        {record.created_at
          ? dateTimestampToLocalString(record.created_at * 1000)
          : "-"}
      </div>
    ),
  },
];
