import * as React from "react";
import { CheckOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { NavigateFunction } from "react-router-dom";
import { IUser } from "../../../../interfaces/users/IUser";
import { IProjectsListColumn } from "../../../../interfaces/projects/IProjectsList";
import { IProjectStatus } from "../../../../interfaces/projects/IProjectStatus";
import { formatNumber } from "../../../../utils/formatNumber";

const ProgressValue = ({
  title,
  quantity,
  totalQuantity,
  summ,
}: {
  title: string;
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
    <div className={isZero ? "projects__progress-value--zero" : undefined}>
      {title}: {currentQuantity} из {total} шт.
      {remaining !== null && ` (ост: ${remaining})`}
      {isComplete && <CheckOutlined className="projects__quantity-check" />} (
      {formatNumber(Number(summ ?? 0))})
    </div>
  );
};

export const projectsMobileColumns = (
  navigate: NavigateFunction,
  usersMap: Record<string, IUser>,
  projectStatuses: IProjectStatus[],
): ColumnsType<IProjectsListColumn> => [
  {
    dataIndex: "mobileData",
    key: "mobileData",
    width: "100%",
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
        <div>Прораб: {usersMap[record.project_leader]?.name}</div>
        <div>
          Статус:{" "}
          {projectStatuses.find((item) => item.value === record.status)
            ?.label ??
            record.status ??
            "—"}
        </div>
        {record.stats && (
          <>
            <ProgressValue
              title="Выполнено"
              quantity={record.stats.shift_report_details_quantity}
              totalQuantity={record.stats.project_work_quantity}
              summ={record.stats.shift_report_details_summ}
            />
            <ProgressValue
              title="Предъявлено"
              quantity={record.stats.presented_quantity}
              totalQuantity={record.stats.project_work_quantity}
              summ={record.stats.presented_summ}
            />
            <ProgressValue
              title="Принято"
              quantity={record.stats.accepted_quantity}
              totalQuantity={record.stats.project_work_quantity}
              summ={record.stats.accepted_summ}
            />
          </>
        )}
      </div>
    ),
  },
];
