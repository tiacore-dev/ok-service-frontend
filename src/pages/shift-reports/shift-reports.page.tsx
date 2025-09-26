"use client";

//shift-reports.page.tsx
import { Breadcrumb, Layout, Table, type TablePaginationConfig } from "antd";
import * as React from "react";
import { shiftReportsDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import type { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./shift-reports.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { minPageHeight } from "../../utils/pageSettings";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { useUsers } from "../../hooks/ApiActions/users";
import { useProjects } from "../../hooks/ApiActions/projects";
import { clearShiftReportsState } from "../../store/modules/pages/shift-reports.state";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useWorks } from "../../hooks/ApiActions/works";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { saveShiftReportsTableState } from "../../store/modules/settings/shift-reports";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { useShiftReportsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import type { IShiftReportQueryParams } from "../../interfaces/shiftReports/IShiftReport";
import type {
  IShiftReportsList,
  IShiftReportsListColumn,
} from "../../interfaces/shiftReports/IShiftReportsList";
import { DownloadShiftReportsWithDetails } from "./components/downloadShiftReportsWithDetails";
import { DownloadObjectVolumeReport } from "./components/downloadObjectVolumeReport";

interface FiltersState {
  user?: string;
  project?: string;
  date_from?: number;
  date_to?: number;
}

export const ShiftReports = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getUsers } = useUsers();
  const { getProjects } = useProjects();
  const { getObjects } = useObjects();
  const { getWorks } = useWorks();

  const tableState = useSelector(
    (state: IState) => state.settings.shiftReportsSettings
  );

  const queryParams: IShiftReportQueryParams = React.useMemo(() => {
    const params: IShiftReportQueryParams = {
      offset: tableState.pagination?.current
        ? (tableState.pagination.current - 1) *
          (tableState.pagination.pageSize || 10)
        : 0,
      limit: tableState.pagination?.pageSize || 10,
    };

    if (tableState.sorter?.field) {
      params.sort_by = tableState.sorter.field as string;
      params.sort_order = tableState.sorter.order === "ascend" ? "asc" : "desc";
    }

    if (tableState.filters?.user) {
      params.user = tableState.filters.user[0] as string;
    }
    if (tableState.filters?.project) {
      params.project = tableState.filters.project[0] as string;
    }
    if (tableState.filters?.date_from) {
      params.date_from = tableState.filters.date_from[0] as number;
    }
    if (tableState.filters?.date_to) {
      params.date_to = tableState.filters.date_to[0] as number;
    }

    return params;
  }, [tableState]);

  const { data: shiftReportsResponse, isLoading } =
    useShiftReportsQuery(queryParams);

  const handleFilterChange = React.useCallback(
    (field: string, value: any) => {
      const newFilters = {
        ...tableState.filters,
        [field]: value ? [value] : null,
      };

      dispatch(
        saveShiftReportsTableState({
          ...tableState,
          filters: newFilters,
          pagination: {
            ...tableState.pagination,
            current: 1,
          },
        })
      );
    },
    [dispatch, tableState]
  );

  const handleResetFilters = React.useCallback(() => {
    dispatch(
      saveShiftReportsTableState({
        ...tableState,
        filters: {},
        pagination: {
          ...tableState.pagination,
          current: 1,
        },
      })
    );
  }, [dispatch, tableState]);

  React.useEffect(() => {
    getUsers();
    getProjects();
    getObjects();
    getWorks();
    return () => {
      dispatch(clearShiftReportsState());
    };
  }, []);

  const tableData = React.useMemo(() => {
    if (!shiftReportsResponse?.shift_reports) return [];

    return shiftReportsResponse.shift_reports.map((doc: IShiftReportsList) => ({
      ...doc,
      key: doc.shift_report_id,
    }));
  }, [shiftReportsResponse]);

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);

  const columns = React.useMemo(
    () =>
      shiftReportsDesktopColumns(
        navigate,
        projectsMap,
        usersMap,
        tableState,
        objectsMap,
        handleFilterChange,
        {
          user: tableState.filters?.user?.[0] as string | undefined,
          project: tableState.filters?.project?.[0] as string | undefined,
          date_from: tableState.filters?.date_from?.[0] as number | undefined,
          date_to: tableState.filters?.date_to?.[0] as number | undefined,
        }
      ),
    [
      navigate,
      projectsMap,
      usersMap,
      tableState,
      objectsMap,
      handleFilterChange,
    ]
  );

  const paginationConfig = React.useMemo(
    () => ({
      ...tableState.pagination,
      total: shiftReportsResponse?.total || 0,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    }),
    [tableState.pagination, shiftReportsResponse?.total]
  );

  const currentFilters: FiltersState = React.useMemo(
    () => ({
      user: tableState.filters?.user?.[0] as string | undefined,
      project: tableState.filters?.project?.[0] as string | undefined,
      date_from: tableState.filters?.date_from?.[0] as number | undefined,
      date_to: tableState.filters?.date_to?.[0] as number | undefined,
    }),
    [tableState.filters]
  );

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter:
      | SorterResult<IShiftReportsListColumn>
      | SorterResult<IShiftReportsListColumn>[]
  ) => {
    // Сохраняем текущие фильтры и объединяем с новыми
    const mergedFilters = {
      ...tableState.filters,
      ...filters,
    };

    dispatch(
      saveShiftReportsTableState({
        pagination,
        filters: mergedFilters,
        sorter: Array.isArray(sorter) ? sorter[0] : sorter,
      })
    );
  };

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Отчеты по сменам" },
        ]}
      />
      <Content
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Filters
            onResetFilters={handleResetFilters}
            currentFilters={currentFilters}
          />
          <DownloadShiftReportsWithDetails currentFilters={currentFilters} />
          <DownloadObjectVolumeReport currentFilters={currentFilters} />
        </div>
        <Table<IShiftReportsListColumn>
          onChange={handleTableChange}
          dataSource={tableData as IShiftReportsListColumn[]}
          columns={columns}
          loading={isLoading}
          pagination={paginationConfig}
        />
      </Content>
    </>
  );
};
