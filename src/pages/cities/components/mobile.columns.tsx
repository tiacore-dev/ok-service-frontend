import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { Space } from "antd";
import { ICitiesListColumn } from "../../../interfaces/cities/ICitiesList";
import { IUser } from "../../../interfaces/users/IUser";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";
import { EditableCityDialog } from "../../../components/ActionDialogs/EditableCityDialog/EditableCityDialog";
import { DeleteCityDialog } from "../../../components/ActionDialogs/DeleteCityDialog";

export const citiesMobileColumns = (
  usersMap: Record<string, IUser>,
  onDelete: (cityId: string, cityName: string) => void,
  canManage: boolean
): ColumnsType<ICitiesListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (_, record) => (
      <div>
        <div className="cities__table__name">{record.name}</div>
        <div>Создатель: {usersMap[record.created_by ?? ""]?.name ?? "—"}</div>

        {canManage && (
          <Space size="middle" style={{ marginTop: 8 }}>
            <EditableCityDialog city={record} iconOnly />
            <DeleteCityDialog
              name={record.name}
              onDelete={() => onDelete(record.city_id, record.name)}
            />
          </Space>
        )}
      </div>
    ),
  },
];
