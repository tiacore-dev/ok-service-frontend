import { Breadcrumb, Layout, Table } from "antd";
import type { TableProps } from "antd";
import * as React from "react";
import { leavesDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./leaves.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { leavesMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { Link } from "react-router-dom";
import { useUsersMap } from "../../queries/users";
import { useLeavesQuery } from "../../queries/leaves";
import { ILeaveListColumn } from "../../interfaces/leaves/ILeaveList";
import { saveLeavesTableState } from "../../store/modules/settings/leaves";

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
        : leavesDesktopColumns(navigate, usersMap, tableState),
    [navigate, usersMap, tableState],
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Листы отсутствия" },
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
        <Filters />
        <Table
          dataSource={leavesData}
          columns={columns}
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
