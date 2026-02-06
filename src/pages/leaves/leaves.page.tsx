import { Breadcrumb, Layout, Table } from "antd";
import type { TableProps } from "antd";
import * as React from "react";
import { leavesDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import type { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./leaves.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { leavesMobileColumns } from "./components/mobile.columns";
import { Link } from "react-router-dom";
import { useUsersMap } from "../../queries/users";
import { useLeavesQuery } from "../../queries/leaves";
import type { ILeaveListColumn } from "../../interfaces/leaves/ILeaveList";
import {
  saveLeavesFiltersState,
  saveLeavesTableState,
} from "../../store/modules/settings/leaves";
import type { ILeavesFiltersState } from "../../interfaces/leaves/ILeavesFiltersState";
import {
  leaveReasonesMap,
  leaveReasonOptions,
} from "../../queries/leaveReasons";
import { Actions } from "./components/actions";

export const Leaves = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const { usersMap } = useUsersMap();
  const { data: leavesList, isFetching } = useLeavesQuery();

  const tableState = useSelector(
    (state: IState) => state.settings.leavesSettings,
  );
  const dispatch = useDispatch();

  const leavesData: ILeaveListColumn[] = React.useMemo(
    () =>
      (leavesList ?? []).map((doc) => ({
        ...doc,
        key: doc.leave_id,
      })),
    [leavesList],
  );
  const filtersState = useSelector(
    (state: IState) => state.settings.leavesSettings.leavesFilters,
  );

  const handleTableChange: TableProps<ILeaveListColumn>["onChange"] = (
    pagination,
    filters,
    sorter,
  ) => {
    dispatch(
      saveLeavesTableState({
        pagination,
        filters,
        sorter: Array.isArray(sorter) ? sorter[0] : sorter,
      }),
    );
  };

  const paginationConfig = React.useMemo<
    TableProps<ILeaveListColumn>["pagination"]
  >(() => {
    const hasSavedPagination =
      Boolean(tableState.pagination?.current) ||
      Boolean(tableState.pagination?.pageSize);

    return hasSavedPagination
      ? tableState.pagination
      : { current: 1, pageSize: 10, showSizeChanger: true };
  }, [tableState.pagination]);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? leavesMobileColumns(navigate)
        : leavesDesktopColumns(navigate, usersMap),
    [navigate, usersMap],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: ILeavesFiltersState) => {
      dispatch(saveLeavesFiltersState(nextFilters));
    },
    [dispatch],
  );

  const reasonSelectOptions = React.useMemo(
    () =>
      leaveReasonOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [],
  );

  const filteredLeavesData: ILeaveListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = leavesData.filter((leave) => {
      const userName = usersMap[leave.user]?.name?.toLowerCase() ?? "";
      const responsibleName =
        usersMap[leave.responsible]?.name?.toLowerCase() ?? "";
      const comment = leave.comment?.toLowerCase() ?? "";

      const matchesSearch = searchValue
        ? userName.includes(searchValue) ||
          responsibleName.includes(searchValue) ||
          comment.includes(searchValue)
        : true;
      const matchesReason = filtersState.reasonId
        ? leave.reason === filtersState.reasonId
        : true;
      const matchesDateFrom = filtersState.dateFrom
        ? (leave.start_date ?? 0) >= filtersState.dateFrom
        : true;
      const matchesDateTo = filtersState.dateTo
        ? (leave.end_date ?? 0) <= filtersState.dateTo
        : true;

      return matchesSearch && matchesReason && matchesDateFrom && matchesDateTo;
    });

    const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
    const compareText = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }) * direction;

    return filtered.sort((a, b) => {
      switch (filtersState.sortField) {
        case "user":
          return compareText(
            usersMap[a.user]?.name ?? "",
            usersMap[b.user]?.name ?? "",
          );
        case "reason":
          return compareText(
            leaveReasonesMap[a.reason]?.name ?? "",
            leaveReasonesMap[b.reason]?.name ?? "",
          );
        case "end_date":
          return ((a.end_date ?? 0) - (b.end_date ?? 0)) * direction;
        case "start_date":
        default:
          return ((a.start_date ?? 0) - (b.start_date ?? 0)) * direction;
      }
    });
  }, [leavesData, filtersState, usersMap]);
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Листы отсутствия" },
        ]}
      />
      <Content className="leaves">
        <Actions />
        <Filters
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
          reasonOptions={reasonSelectOptions}
        />
        <Table
          dataSource={filteredLeavesData}
          columns={columns}
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
