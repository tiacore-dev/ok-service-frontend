import { Breadcrumb, Layout, Table } from "antd";
import type { TableProps } from "antd";
import * as React from "react";
import { usersDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./users.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { usersMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IUsersListColumn } from "../../interfaces/users/IUsersList";
import { Link } from "react-router-dom";
import { saveUsersTableState } from "../../store/modules/settings/users";
import { useUsersQuery } from "../../queries/users";
import { useRoles } from "../../queries/roles";
import { useCitiesMap } from "../../queries/cities";

export const Users = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const { data: usersList, isFetching } = useUsersQuery();

  const tableState = useSelector(
    (state: IState) => state.settings.usersSettings,
  );
  const dispatch = useDispatch();

  const usersData: IUsersListColumn[] = React.useMemo(
    () =>
      (usersList ?? [])
        .filter((user) => !user.deleted)
        .map((doc) => ({ ...doc, key: doc.user_id })),
    [usersList],
  );
  const { rolesMap, roleOptions } = useRoles();
  const { citiesMap, cityOptions } = useCitiesMap();

  const handleTableChange: TableProps<IUsersListColumn>["onChange"] = (
    pagination,
    filters,
    sorter,
  ) => {
    dispatch(
      saveUsersTableState({
        pagination,
        filters,
        sorter: Array.isArray(sorter) ? sorter[0] : sorter,
      }),
    );
  };

  const paginationConfig = React.useMemo<
    TableProps<IUsersListColumn>["pagination"]
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
        ? usersMobileColumns(navigate, rolesMap, citiesMap)
        : usersDesktopColumns(
            navigate,
            rolesMap,
            citiesMap,
            roleOptions,
            cityOptions,
            tableState,
          ),
    [navigate, rolesMap, roleOptions, tableState, citiesMap],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Пользователи" },
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
          dataSource={usersData}
          columns={columns}
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
