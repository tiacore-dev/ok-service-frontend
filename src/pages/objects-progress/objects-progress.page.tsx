import * as React from "react";
import { Breadcrumb, Input, Spin, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import type {
  IObjectStatsItem,
  IObjectWorkStats,
} from "../../interfaces/objects/IObjectStats";
import { useObjectsStatsQuery } from "../../queries/objectStats";
import { formatNumber } from "../../utils/formatNumber";
import "./objects-progress.page.less";

const defaultPageSize = 20;

const formatQuantity = (value: number | null | undefined) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    Number(value ?? 0),
  );

const formatCurrency = (value: number | null | undefined) =>
  formatNumber(Number(value ?? 0));

const ProgressMetric = ({
  quantity,
  summ,
  estimateSumm,
}: {
  quantity: number | null;
  summ: number | null;
  estimateSumm?: number | null;
}) => (
  <div className="objects-progress__metric">
    <div>{formatQuantity(quantity)} шт.</div>
    {estimateSumm === undefined ? (
      <div>{formatCurrency(summ)}</div>
    ) : (
      <>
        <div>Факт: {formatCurrency(summ)}</div>
        <div className="objects-progress__metric-secondary">
          Смета: {formatCurrency(estimateSumm)}
        </div>
      </>
    )}
  </div>
);

const createColumns = (): ColumnsType<IObjectStatsItem> => [
  {
    title: "Объект",
    dataIndex: "name",
    key: "name",
    width: "34%",
  },
  {
    title: "Предъявлено",
    key: "presented",
    width: "15%",
    align: "right",
    render: (_: unknown, record: IObjectStatsItem) => (
      <ProgressMetric
        quantity={record.stats.presented_quantity}
        summ={record.stats.presented_summ}
      />
    ),
  },
  {
    title: "Выполнено",
    key: "completed",
    width: "20%",
    align: "right",
    render: (_: unknown, record: IObjectStatsItem) => (
      <ProgressMetric
        quantity={record.stats.shift_report_details_quantity}
        summ={record.stats.shift_report_details_summ}
        estimateSumm={record.stats.shift_report_details_summ_by_estimate}
      />
    ),
  },
  {
    title: "Принято",
    key: "accepted",
    width: "15%",
    align: "right",
    render: (_: unknown, record: IObjectStatsItem) => (
      <ProgressMetric
        quantity={record.stats.accepted_quantity}
        summ={record.stats.accepted_summ}
      />
    ),
  },
  {
    title: "Итого",
    key: "total",
    width: "16%",
    align: "right",
    render: (_: unknown, record: IObjectStatsItem) => (
      <ProgressMetric
        quantity={record.stats.project_work_quantity}
        summ={record.stats.project_work_summ}
      />
    ),
  },
];

const renderTotalRow = (stats: IObjectWorkStats) => (
  <Table.Summary.Row className="objects-progress__total-row">
    <Table.Summary.Cell index={0}>Итого</Table.Summary.Cell>
    <Table.Summary.Cell index={1}>
      <ProgressMetric
        quantity={stats.presented_quantity}
        summ={stats.presented_summ}
      />
    </Table.Summary.Cell>
    <Table.Summary.Cell index={2}>
      <ProgressMetric
        quantity={stats.shift_report_details_quantity}
        summ={stats.shift_report_details_summ}
        estimateSumm={stats.shift_report_details_summ_by_estimate}
      />
    </Table.Summary.Cell>
    <Table.Summary.Cell index={3}>
      <ProgressMetric
        quantity={stats.accepted_quantity}
        summ={stats.accepted_summ}
      />
    </Table.Summary.Cell>
    <Table.Summary.Cell index={4}>
      <ProgressMetric
        quantity={stats.project_work_quantity}
        summ={stats.project_work_summ}
      />
    </Table.Summary.Cell>
  </Table.Summary.Row>
);

export const ObjectsProgress = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [search, setSearch] = React.useState("");
  const { data, isPending, isError } = useObjectsStatsQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    search,
  });
  const columns = React.useMemo(createColumns, []);

  return (
    <main className="objects-progress">
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Прогресс работ" },
        ]}
      />
      <div className="objects-progress__header">
        <Typography.Title level={3}>
          Прогресс выполненных работ
        </Typography.Title>
        <Input.Search
          allowClear
          placeholder="Поиск по объекту"
          onSearch={(value) => {
            setPage(1);
            setSearch(value.trim());
          }}
        />
      </div>
      {isError ? (
        <Typography.Text type="danger">
          Не удалось загрузить статистику объектов.
        </Typography.Text>
      ) : isPending ? (
        <Spin />
      ) : (
        <Table
          className="objects-progress__table"
          rowKey="object_id"
          columns={columns}
          dataSource={data?.objects ?? []}
          pagination={{
            current: page,
            pageSize,
            total: data?.total_count ?? 0,
            pageSizeOptions: ["20", "50", "100"],
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          summary={(pageData) =>
            data?.total && pageData.length > 0
              ? renderTotalRow(data.total)
              : null
          }
        />
      )}
    </main>
  );
};
