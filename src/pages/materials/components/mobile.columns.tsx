import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IMaterialsListColumn } from "../../../interfaces/materials/IMaterialsList";
import { RoleId } from "../../../interfaces/roles/IRole";
import { DeleteOutlined } from "@ant-design/icons";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";

export const materialsMobileColumns = (
  navigate: NavigateFunction,
  role: RoleId,
): ColumnsType<IMaterialsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (_text: string, record: IMaterialsListColumn) => (
      <div>
        {role === RoleId.USER ? (
          <div>
            {record.deleted && (
              <DeleteOutlined style={{ marginRight: "8px" }} />
            )}
            {record.name}
          </div>
        ) : (
          <div>
            {record.deleted && (
              <DeleteOutlined style={{ marginRight: "8px" }} />
            )}
            <a
              className="materials__table__number"
              onClick={() => navigate && navigate(`/materials/${record.key}`)}
            >
              {record.name}
            </a>
          </div>
        )}
        <div>Единица измерения: {record.measurement_unit}</div>
        <div>
          Дата создания:{" "}
          {record.created_at
            ? dateTimestampToLocalString(record.created_at * 1000)
            : "-"}
        </div>
      </div>
    ),
  },
];
