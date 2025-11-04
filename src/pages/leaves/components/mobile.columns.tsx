import * as React from "react";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { ILeaveListColumn } from "../../../interfaces/leaves/ILeaveList";
import { leaveReasonesMap } from "../../../queries/leaveReasons";

export const leavesMobileColumns = (
  navigate: NavigateFunction,
): ColumnsType<ILeaveListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>
        <a
          className="leaves__table__number"
          onClick={() => navigate && navigate(`/leaves/${record.key}`)}
        >
          {record.start_date} - {record.end_date}
        </a>
        {/* <div>Адрес: {record.address}</div> */}
        {/* <div>Описание: {record.description}</div> */}
        <div>
          Причина: {record.reason ? leaveReasonesMap[record.reason]?.name : "—"}
        </div>
        {/* <div>Статус: {statusMap[record.status]?.name}</div> */}
      </div>
    ),
  },
];
