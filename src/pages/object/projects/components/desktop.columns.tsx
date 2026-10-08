import * as React from "react";
import { CheckOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { NavigateFunction } from "react-router-dom";
import type { IProjectsListColumn } from "../../../../interfaces/projects/IProjectsList";
import type { IProjectStatus } from "../../../../interfaces/projects/IProjectStatus";
import type { IUser } from "../../../../interfaces/users/IUser";
import type { IObjectWorkStats } from "../../../../interfaces/objects/IObjectStats";
import { formatNumber } from "../../../../utils/formatNumber";

const formatQuantity = (value: number | null | undefined) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    Number(value ?? 0),
  );

const ProgressValue = ({
  quantity,
  totalQuantity,
  summ,
}: {
  quantity: number | null | undefined;
  totalQuantity: number | null | undefined;
  summ: number | null | undefined;
}) => {
  const currentQuantity = Number(quantity ?? 0);
  const total = Number(totalQuantity ?? 0);
  const isZero = currentQuantity === 0;
  const isComplete = total > 0 && currentQuantity === total;
  const remaining =
    currentQuantity > 0 && currentQuantity < total
      ? total - currentQuantity
      : null;

  return (
    <div
      className={`projects__progress-value${
        isZero ? " projects__progress-value--zero" : ""
      }`}
    >
      <div>
        {formatQuantity(currentQuantity)} из {formatQuantity(total)} шт.
        {remaining !== null && ` (ост: ${formatQuantity(remaining)})`}
        {isComplete && <CheckOutlined className="projects__quantity-check" />}
      </div>
      <div>{formatNumber(Number(summ ?? 0))}</div>
    </div>
  );
};

const progressColumn = (
  title: string,
  key: string,
  getQuantity: (stats: IObjectWorkStats) => number | null,
  getSumm: (stats: IObjectWorkStats) => number | null,
) => ({
  title,
  key,
  width: "15%",
  align: "right" as const,
  render: (_: unknown, record: IProjectsListColumn) =>
    record.stats ? (
      <ProgressValue
        quantity={getQuantity(record.stats)}
        totalQuantity={record.stats.project_work_quantity}
        summ={getSumm(record.stats)}
      />
    ) : (
      "—"
    ),
});

export const projectsDesktopColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
  projectStatuses: IProjectStatus[],
): ColumnsType<IProjectsListColumn> => [
  {
    title: "Спецификация",
    dataIndex: "name",
    key: "name",
    width: "25%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>
        {record.isWork ? (
          <span>{record.name}</span>
        ) : (
          <a
            className="projects__table__number"
            onClick={() => navigate && navigate(`/projects/${record.key}`)}
          >
            {record.name}
          </a>
        )}
      </div>
    ),
  },
  {
    title: "Прораб",
    dataIndex: "project_leader",
    key: "project_leader",
    width: "15%",
    render: (text: string, record: IProjectsListColumn) => (
      <div>{usersMap[record.project_leader]?.name}</div>
    ),
  },
  {
    title: "Статус",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (status?: string) =>
      projectStatuses.find((item) => item.value === status)?.label ??
      status ??
      "—",
  },
  progressColumn(
    "Выполнено",
    "completed",
    (stats) => stats.shift_report_details_quantity,
    (stats) => stats.shift_report_details_summ,
  ),
  progressColumn(
    "Предъявлено",
    "presented",
    (stats) => stats.presented_quantity,
    (stats) => stats.presented_summ,
  ),
  progressColumn(
    "Принято",
    "accepted",
    (stats) => stats.accepted_quantity,
    (stats) => stats.accepted_summ,
  ),
];
