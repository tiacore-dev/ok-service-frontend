import * as React from "react";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IUser } from "../../../interfaces/users/IUser";
import type { ILeaveListColumn } from "../../../interfaces/leaves/ILeaveList";
import { leaveReasonesMap } from "../../../queries/leaveReasons";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";

export const leavesDesktopColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
): ColumnsType<ILeaveListColumn> => [
  {
    title: "Сотрудник",
    dataIndex: "manager",
    key: "manager",
    width: "35%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>
        <a
          className="leaves__table__number"
          onClick={() => navigate && navigate(`/leaves/${record.key}`)}
        >
          {usersMap[record.user]?.name}
        </a>
      </div>
    ),
  },
  {
    title: "Причина",
    dataIndex: "reason",
    key: "reason",
    width: "15%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>{leaveReasonesMap[record.reason]?.name}</div>
    ),
  },
  {
    title: "Дата c",
    dataIndex: "start_date",
    key: "start_date",
    width: "15%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>{record.start_date ? dateTimestampToLocalString(record.start_date) : "-"}</div>
    ),
  },
  {
    title: "Дата по",
    dataIndex: "end_date",
    key: "end_date",
    width: "15%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>{record.end_date ? dateTimestampToLocalString(record.end_date) : "-"}</div>
    ),
  },
  {
    title: "Комментарий",
    dataIndex: "comment",
    key: "comment",
    width: "20%",
    render: (text: string, record: ILeaveListColumn) => (
      <div>{record.comment}</div>
    ),
  },
];
