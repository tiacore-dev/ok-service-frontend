import * as React from "react";
import { Breadcrumb, Input, Spin, Table, Typography } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import type { IObjectWorkStats } from "../../interfaces/objects/IObjectStats";
import {
  useObjectStatsQueries,
  useObjectsStatsQuery,
} from "../../queries/objectStats";
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

type ProgressRowKind = "object" | "project" | "work" | "loading" | "error";

interface IProgressTreeRow {
  key: string;
  kind: ProgressRowKind;
  objectId?: string;
  name: string;
  stats: IObjectWorkStats;
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

const createColumns = (): ColumnsType<IProgressTreeRow> => [
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
    title: "Предъявлено",
    key: "presented",
    width: "15%",
    align: "right",
    render: (_: unknown, record) =>
      isStatusRow(record) ? null : (
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
    render: (_: unknown, record) =>
      isStatusRow(record) ? null : (
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
    render: (_: unknown, record) =>
      isStatusRow(record) ? null : (
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
    render: (_: unknown, record) =>
      isStatusRow(record) ? null : (
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
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>([]);
  const [requestedObjectIds, setRequestedObjectIds] = React.useState<string[]>(
    [],
  );
  const { data, isPending, isError } = useObjectsStatsQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    search,
  });
  const { statsQueries, detailsQueries } =
    useObjectStatsQueries(requestedObjectIds);
  const columns = React.useMemo(createColumns, []);
  const objectQueryById = React.useMemo(
    () =>
      new Map(
        requestedObjectIds.map((objectId, index) => [
          objectId,
          {
            statsQuery: statsQueries[index],
            detailsQuery: detailsQueries[index],
          },
        ]),
      ),
    [detailsQueries, requestedObjectIds, statsQueries],
  );
  const treeData = React.useMemo<IProgressTreeRow[]>(
    () =>
      (data?.objects ?? []).map((object) => {
        const queries = objectQueryById.get(object.object_id);
        const isLoadingDetails =
          !queries ||
          queries.statsQuery?.isPending ||
          queries.detailsQuery?.isPending;
        const hasDetailsError =
          queries?.statsQuery?.isError || queries?.detailsQuery?.isError;

        if (isLoadingDetails || hasDetailsError) {
          return {
            key: `object-${object.object_id}`,
            kind: "object",
            objectId: object.object_id,
            name: object.name,
            stats: object.stats,
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

        const detailsByProjectId = new Map(
          queries.detailsQuery?.data?.projects.map((project) => [
            project.project_id,
            project,
          ]),
        );

        return {
          key: `object-${object.object_id}`,
          kind: "object",
          objectId: object.object_id,
          name: object.name,
          stats: object.stats,
          children: (queries.statsQuery?.data?.projects ?? []).map(
            (project) => {
              const details = detailsByProjectId.get(project.project_id);

              return {
                key: `project-${project.project_id}`,
                kind: "project",
                name: project.name,
                stats: project.stats,
                children: details
                  ? Object.entries(details.stats).map(
                      ([projectWorkId, stat]): IProgressTreeRow => ({
                        key: `work-${projectWorkId}`,
                        kind: "work",
                        name: stat.project_work_name,
                        stats: stat,
                      }),
                    )
                  : undefined,
              };
            },
          ),
        };
      }),
    [data?.objects, objectQueryById],
  );

  const resetExpandedObjects = () => {
    setExpandedRowKeys([]);
    setRequestedObjectIds([]);
  };

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
            resetExpandedObjects();
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
            rowExpandable: (record) =>
              record.kind === "object" || record.kind === "project",
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
              record.kind === "object" || record.kind === "project" ? (
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
              ? renderTotalRow(data.total)
              : null
          }
        />
      )}
    </main>
  );
};
