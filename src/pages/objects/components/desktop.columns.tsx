import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IObjectListColumn } from "../../../interfaces/objects/IObjectList";
import { useSelector } from "react-redux";
import { getObjectStatuses } from "../../../store/modules/dictionaries/selectors/objectStatuses.selector";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";

export const objectsDesktopColumns = (
  navigate: NavigateFunction
): ColumnsType<IObjectListColumn> => {
  const statusMap = useSelector(getObjectStatuses);
  return [
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      width: "20%",

      render: (text: string, record: IObjectListColumn) => (
        <div>
          <a
            className="objects__table__number"
            onClick={() => navigate && navigate(`/objects/${record.key}`)}
          >
            {record.name}
          </a>
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "20%",
      render: (text: string, record: IObjectListColumn) => (
        <div>{record.object_id}</div>
      ),
    },
    {
      title: "Адрес",
      dataIndex: "address",
      key: "address",
      width: "20%",
      render: (text: string, record: IObjectListColumn) => (
        <div>
          <div>{record.address}</div>
        </div>
      ),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      width: "20%",
      render: (text: string, record: IObjectListColumn) => (
        <div>
          <div>{record.description}</div>
        </div>
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (text: string, record: IObjectListColumn) => (
        <div>
          <div>
            {
              statusMap.find(
                (item: IObjectStatus) => item.object_status_id === record.status
              ).name
            }
          </div>
        </div>
      ),
    },
  ];
};
