import * as React from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Breadcrumb,
  Button,
  DatePicker,
  Layout,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
  type TablePaginationConfig,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import type { DataNode } from "antd/es/tree";
import { Link, useNavigate } from "react-router-dom";
import type { IAcceptance } from "../../interfaces/acceptances/IAcceptance";
import { useAcceptancesQuery } from "../../queries/acceptances";
import { useObjectsMap } from "../../queries/objects";
import { useProjectsMap } from "../../queries/projects";
import { dateFormat } from "../../utils/dateConverter";
import { acceptanceStatusOptions } from "../../components/acceptances/AcceptanceFormModal";
import "./acceptances.page.less";

const { RangePicker } = DatePicker;

const statusColors = {
  presented: "blue",
  violations_found: "orange",
  accepted_on_site: "green",
  documents_signed: "success",
} as const;

interface AcceptanceRow extends IAcceptance {
  key: string;
  projectName: string;
  objectName: string;
}

export const Acceptances = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const { data: acceptances = [], isLoading, isError } = useAcceptancesQuery();
  const { projects, projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();
  const [projectId, setProjectId] = React.useState<string>();
  const [statuses, setStatuses] = React.useState<IAcceptance["status"][]>([]);
  const [dateRange, setDateRange] = React.useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
  const [pagination, setPagination] = React.useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
  });
  const [sorter, setSorter] = React.useState<SorterResult<AcceptanceRow>>({
    field: "date",
    order: "descend",
  });

  const projectsTreeData = React.useMemo<DataNode[]>(() => {
    const projectsByObject = projects.reduce<Record<string, typeof projects>>(
      (result, project) => {
        if (!project.project_id) return result;
        if (!result[project.object]) result[project.object] = [];
        result[project.object].push(project);
        return result;
      },
      {},
    );

    return Object.entries(projectsByObject).map(
      ([objectId, objectProjects]) => ({
        title: objectsMap[objectId]?.name ?? "Без названия",
        value: `object:${objectId}`,
        key: `object:${objectId}`,
        selectable: false,
        children: objectProjects.map((project) => ({
          title: project.name,
          value: project.project_id!,
          key: project.project_id!,
        })),
      }),
    );
  }, [objectsMap, projects]);

  const rows = React.useMemo<AcceptanceRow[]>(
    () =>
      acceptances.map((acceptance) => {
        const project = projectsMap[acceptance.project_id];
        return {
          ...acceptance,
          key: acceptance.id,
          projectName: project?.name ?? acceptance.project_id,
          objectName: project
            ? objectsMap[project.object]?.name ?? project.object
            : "—",
        };
      }),
    [acceptances, objectsMap, projectsMap],
  );

  const filteredRows = React.useMemo(() => {
    const [dateFrom, dateTo] = dateRange;
    const direction = sorter.order === "ascend" ? 1 : -1;
    const compareText = (left: string, right: string) =>
      left.localeCompare(right, "ru", { sensitivity: "base" }) * direction;

    return rows
      .filter((row) => {
        if (projectId && row.project_id !== projectId) {
          return false;
        }
        if (statuses.length && !statuses.includes(row.status)) return false;
        if (dateFrom && row.date < dateFrom.startOf("day").valueOf()) {
          return false;
        }
        if (dateTo && row.date > dateTo.endOf("day").valueOf()) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        switch (sorter.field) {
          case "projectName":
            return compareText(left.projectName, right.projectName);
          case "objectName":
            return compareText(left.objectName, right.objectName);
          case "status":
            return compareText(left.status, right.status);
          case "comment":
            return compareText(left.comment ?? "", right.comment ?? "");
          case "date":
          default:
            return (left.date - right.date) * direction;
        }
      });
  }, [dateRange, projectId, rows, sorter, statuses]);

  const resetFilters = () => {
    setProjectId(undefined);
    setStatuses([]);
    setDateRange([null, null]);
    setPagination((current) => ({ ...current, current: 1 }));
  };

  const changeFilters = (callback: () => void) => {
    callback();
    setPagination((current) => ({ ...current, current: 1 }));
  };

  const columns = React.useMemo(
    () => [
      {
        title: "Дата",
        dataIndex: "date",
        key: "date",
        sorter: true,
        sortOrder: sorter.field === "date" ? sorter.order : null,
        render: (date: number, row: AcceptanceRow) => (
          <Button
            type="link"
            className="acceptances__link"
            onClick={() => navigate(`/acceptances/${row.id}`)}
          >
            {dayjs(date).format(dateFormat)}
          </Button>
        ),
      },
      {
        title: "Объект",
        dataIndex: "objectName",
        key: "objectName",
        sorter: true,
        sortOrder: sorter.field === "objectName" ? sorter.order : null,
      },
      {
        title: "Спецификация",
        dataIndex: "projectName",
        key: "projectName",
        sorter: true,
        sortOrder: sorter.field === "projectName" ? sorter.order : null,
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        sorter: true,
        sortOrder: sorter.field === "status" ? sorter.order : null,
        render: (status: IAcceptance["status"]) => (
          <Tag color={statusColors[status]}>
            {acceptanceStatusOptions.find((option) => option.value === status)
              ?.label ?? status}
          </Tag>
        ),
      },
      {
        title: "Комментарий",
        dataIndex: "comment",
        key: "comment",
        sorter: true,
        sortOrder: sorter.field === "comment" ? sorter.order : null,
        render: (comment?: string) => comment || "—",
      },
    ],
    [navigate, sorter],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Приёмки работ" },
        ]}
      />
      <Content className="acceptances">
        <Space className="acceptances__filters" wrap>
          <TreeSelect
            allowClear
            showSearch
            className="acceptances__filter"
            placeholder="Спецификация"
            value={projectId}
            treeData={projectsTreeData}
            treeNodeFilterProp="title"
            onChange={(value) =>
              changeFilters(() =>
                setProjectId(value === undefined ? undefined : String(value)),
              )
            }
          />
          <Select
            mode="multiple"
            allowClear
            className="acceptances__filter"
            placeholder="Статусы"
            value={statuses}
            options={[...acceptanceStatusOptions]}
            onChange={(value) =>
              changeFilters(() => setStatuses(value as IAcceptance["status"][]))
            }
          />
          <RangePicker
            className="acceptances__date-range"
            format="DD.MM.YYYY"
            placeholder={["Дата с", "Дата по"]}
            value={dateRange}
            onChange={(value) =>
              changeFilters(() => setDateRange(value ?? [null, null]))
            }
          />
          <Button onClick={resetFilters}>Сбросить</Button>
        </Space>
        {isError ? (
          <Alert
            type="error"
            showIcon
            message="Не удалось загрузить приёмки работ"
          />
        ) : (
          <Table<AcceptanceRow>
            rowKey="id"
            dataSource={filteredRows}
            columns={columns}
            loading={isLoading}
            pagination={{
              ...pagination,
              total: filteredRows.length,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100"],
            }}
            onChange={(nextPagination, _filters, nextSorter) => {
              setPagination(nextPagination);
              setSorter(
                (Array.isArray(nextSorter)
                  ? nextSorter[0]
                  : nextSorter) as SorterResult<AcceptanceRow>,
              );
            }}
          />
        )}
      </Content>
    </>
  );
};
