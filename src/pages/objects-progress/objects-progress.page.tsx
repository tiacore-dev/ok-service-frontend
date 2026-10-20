import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Input,
  Spin,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  CaretRightOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import type {
  IObjectProgressStats,
  IObjectWorkStats,
} from "../../interfaces/objects/IObjectStats";
import {
  objectStatsKeys,
  useObjectStatsQueries,
  useObjectsStatsQuery,
} from "../../queries/objectStats";
import { formatNumber } from "../../utils/formatNumber";
import { getObjectProgressStats } from "../../utils/getObjectProgressStats";
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
  totalQuantity,
  summ,
  estimateSumm,
}: {
  quantity: number | null;
  totalQuantity?: number | null;
  summ: number | null;
  estimateSumm?: number | null;
}) => (
  <div className="objects-progress__metric">
    {/*
    <div>{formatQuantity(quantity)} шт.</div>
    */}
    <QuantityProgress quantity={quantity} totalQuantity={totalQuantity} />
    {estimateSumm === undefined ? (
      <div>{formatCurrency(summ)}</div>
    ) : (
      <>
        <div>{formatCurrency(estimateSumm)}</div>
        <div>ФОТ: {formatCurrency(summ)}</div>
      </>
    )}
  </div>
);

const QuantityProgress = ({
  quantity,
  totalQuantity,
}: {
  quantity: number | null;
  totalQuantity?: number | null;
}) => {
  const currentQuantity = Number(quantity ?? 0);
  const total = Number(totalQuantity ?? 0);
  const isZero = currentQuantity === 0;
  const isComplete =
    totalQuantity !== undefined && total > 0 && currentQuantity === total;
  const remaining =
    totalQuantity !== undefined &&
    currentQuantity > 0 &&
    currentQuantity < total
      ? total - currentQuantity
      : null;

  return (
    <div className={isZero ? "objects-progress__quantity--zero" : undefined}>
      {formatQuantity(currentQuantity)}
      {totalQuantity !== undefined && ` из ${formatQuantity(total)}`} шт.
      {remaining !== null && ` (ост: ${formatQuantity(remaining)})`}
      {isComplete && (
        <CheckOutlined className="objects-progress__quantity-check" />
      )}
    </div>
  );
};

type ProgressRowKind = "object" | "project" | "loading" | "error";

interface IProgressTreeRow {
  key: string;
  kind: ProgressRowKind;
  objectId?: string;
  name: string;
  stats: IObjectProgressStats | null;
  children?: IProgressTreeRow[];
}

const emptyStats: IObjectWorkStats = {
  project_work_quantity: 0,
  project_work_summ: 0,
  shift_report_details_quantity: 0,
  shift_report_details_summ: 0,
  shift_report_details_summ_by_estimate: 0,
  presented_quantity: 0,
  presented_summ: 0,
  accepted_quantity: 0,
  accepted_summ: 0,
};

const isStatusRow = (record: IProgressTreeRow) =>
  record.kind === "loading" || record.kind === "error";

const createColumns = (): ColumnsType<IProgressTreeRow> => {
  const columns: ColumnsType<IProgressTreeRow> = [
    {
      title: "Объект",
      dataIndex: "name",
      key: "name",
      width: "34%",
      render: (name: string, record) => {
        if (record.kind === "loading") {
          return <Spin size="small" />;
        }

        return (
          <span className="objects-progress__name" title={name}>
            {name}
          </span>
        );
      },
    },
    {
      title: "Выполнено",
      key: "completed",
      width: "22%",
      align: "right",
      render: (_: unknown, record) =>
        isStatusRow(record) || record.stats == null ? null : (
          <ProgressMetric
            quantity={record.stats.shift_report_details_quantity}
            totalQuantity={record.stats.project_work_quantity}
            summ={record.stats.shift_report_details_summ}
            estimateSumm={
              record.stats.completed_estimate_summ ??
              record.stats.shift_report_details_summ_by_estimate
            }
          />
        ),
    },
    {
      title: "Предъявлено",
      key: "presented",
      width: "22%",
      align: "right",
      render: (_: unknown, record) =>
        isStatusRow(record) || record.stats == null ? null : (
          <ProgressMetric
            quantity={record.stats.presented_quantity}
            totalQuantity={record.stats.project_work_quantity}
            summ={record.stats.presented_summ}
          />
        ),
    },
    {
      title: "Принято",
      key: "accepted",
      width: "22%",
      align: "right",
      render: (_: unknown, record) =>
        isStatusRow(record) || record.stats == null ? null : (
          <ProgressMetric
            quantity={record.stats.accepted_quantity}
            totalQuantity={record.stats.project_work_quantity}
            summ={record.stats.accepted_summ}
          />
        ),
    },
    {
      title: "Итого",
      key: "total",
      width: "16%",
      align: "right",
      render: (_: unknown, record) =>
        isStatusRow(record) || record.stats == null ? null : (
          <ProgressMetric
            quantity={record.stats.project_work_quantity}
            summ={
              record.stats.specification_summ ?? record.stats.project_work_summ
            }
          />
        ),
    },
  ];

  return columns.filter((column) => column.key !== "total");
};

const renderTotalRow = (stats: IObjectProgressStats) => (
  <Table.Summary.Row className="objects-progress__total-row">
    <Table.Summary.Cell index={0}>Итого</Table.Summary.Cell>
    <Table.Summary.Cell index={1}>
      <ProgressMetric
        quantity={stats.shift_report_details_quantity}
        totalQuantity={stats.project_work_quantity}
        summ={stats.shift_report_details_summ}
        estimateSumm={
          stats.completed_estimate_summ ??
          stats.shift_report_details_summ_by_estimate
        }
      />
    </Table.Summary.Cell>
    <Table.Summary.Cell index={2}>
      <ProgressMetric
        quantity={stats.presented_quantity}
        totalQuantity={stats.project_work_quantity}
        summ={stats.presented_summ}
      />
    </Table.Summary.Cell>
    <Table.Summary.Cell index={3}>
      <ProgressMetric
        quantity={stats.accepted_quantity}
        totalQuantity={stats.project_work_quantity}
        summ={stats.accepted_summ}
      />
    </Table.Summary.Cell>
  </Table.Summary.Row>
);

export const ObjectsProgress = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [search, setSearch] = React.useState("");
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>([]);
  const [requestedObjectIds, setRequestedObjectIds] = React.useState<string[]>(
    [],
  );
  const queryClient = useQueryClient();
  const { data, isPending, isError, isFetching } = useObjectsStatsQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    search,
  });
  const { statsQueries } = useObjectStatsQueries(requestedObjectIds);
  const columns = React.useMemo(createColumns, []);
  const objectQueryById = React.useMemo(
    () =>
      new Map(
        requestedObjectIds.map((objectId, index) => [
          objectId,
          {
            statsQuery: statsQueries[index],
          },
        ]),
      ),
    [requestedObjectIds, statsQueries],
  );
  const treeData = React.useMemo<IProgressTreeRow[]>(
    () =>
      (data?.objects ?? []).map((object) => {
        const queries = objectQueryById.get(object.object_id);
        const isLoadingDetails = !queries || queries.statsQuery?.isPending;
        const hasDetailsError = queries?.statsQuery?.isError;

        if (isLoadingDetails || hasDetailsError) {
          return {
            key: `object-${object.object_id}`,
            kind: "object",
            objectId: object.object_id,
            name: object.name,
            stats: getObjectProgressStats(object.stats, object.material_totals),
            children: [
              {
                key: `object-${object.object_id}-${
                  hasDetailsError ? "error" : "loading"
                }`,
                kind: hasDetailsError ? "error" : "loading",
                name: hasDetailsError
                  ? "Не удалось загрузить детализацию объекта"
                  : "Загрузка детализации…",
                stats: emptyStats,
              },
            ],
          };
        }

        return {
          key: `object-${object.object_id}`,
          kind: "object",
          objectId: object.object_id,
          name: object.name,
          stats: getObjectProgressStats(object.stats, object.material_totals),
          children: (queries.statsQuery?.data?.projects ?? []).map(
            (project) => ({
              key: `project-${project.project_id}`,
              kind: "project",
              name: project.name,
              stats: getObjectProgressStats(
                project.stats,
                project.material_stats,
              ),
            }),
          ),
        };
      }),
    [data?.objects, objectQueryById],
  );

  const resetExpandedObjects = () => {
    setExpandedRowKeys([]);
    setRequestedObjectIds([]);
  };

  const refreshStatistics = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: objectStatsKeys.collection() });
  }, [queryClient]);

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
        <div className="objects-progress__actions">
          <Input.Search
            allowClear
            placeholder="Поиск по объекту"
            onSearch={(value) => {
              setPage(1);
              setSearch(value.trim());
              resetExpandedObjects();
            }}
          />
          <Tooltip title="Обновить статистику">
            <Button
              aria-label="Обновить статистику"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={refreshStatistics}
            />
          </Tooltip>
        </div>
      </div>
      {isError ? (
        <Typography.Text type="danger">
          Не удалось загрузить статистику объектов.
        </Typography.Text>
      ) : isPending ? (
        <Spin />
      ) : (
        <Table<IProgressTreeRow>
          className="objects-progress__table objects-progress__tree-table"
          rowKey="key"
          columns={columns}
          dataSource={treeData}
          rowClassName={(record) => `objects-progress__${record.kind}-row`}
          tableLayout="fixed"
          expandable={{
            expandedRowKeys,
            indentSize: 24,
            rowExpandable: (record) => record.kind === "object",
            onExpand: (expanded, record) => {
              setExpandedRowKeys((previousKeys) =>
                expanded
                  ? [...previousKeys, record.key]
                  : previousKeys.filter((key) => key !== record.key),
              );

              if (expanded && record.kind === "object" && record.objectId) {
                setRequestedObjectIds((previousIds) =>
                  previousIds.includes(record.objectId as string)
                    ? previousIds
                    : [...previousIds, record.objectId as string],
                );
              }
            },
            expandIcon: ({ expanded, onExpand, record }) =>
              record.kind === "object" ? (
                <button
                  aria-label={expanded ? "Свернуть" : "Развернуть"}
                  className="objects-progress__tree-toggle"
                  onClick={(event) => onExpand(record, event)}
                  type="button"
                >
                  <CaretRightOutlined rotate={expanded ? 90 : 0} />
                </button>
              ) : (
                <span
                  aria-hidden
                  className="objects-progress__tree-toggle objects-progress__tree-toggle--placeholder"
                />
              ),
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.total_count ?? 0,
            pageSizeOptions: ["20", "50", "100"],
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
              resetExpandedObjects();
            },
          }}
          summary={(pageData) =>
            data?.total && pageData.length > 0
              ? renderTotalRow(
                  getObjectProgressStats(data.total, data.material_totals),
                )
              : null
          }
        />
      )}
    </main>
  );
};
