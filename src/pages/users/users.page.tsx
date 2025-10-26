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
import { useUsers } from "../../hooks/ApiActions/users";
import {
  getRolesMap,
  getRolesOptions,
} from "../../store/modules/dictionaries/selectors/roles.selector";
import { Link } from "react-router-dom";
import { getCitiesMap } from "../../store/modules/pages/selectors/cities.selector";
import { saveUsersTableState } from "../../store/modules/settings/users";

export const Users = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.usersSettings.filters,
  );

  const { getUsers } = useUsers();

  React.useEffect(() => {
    getUsers();
  }, [filters]);

  const tableState = useSelector(
    (state: IState) => state.settings.usersSettings,
  );
  const dispatch = useDispatch();

  const usersData: IUsersListColumn[] = useSelector(
    (state: IState) => state.pages.users.data,
  )
    .filter((user) => !user.deleted)
    .map((doc) => ({ ...doc, key: doc.user_id }));

  const isLoading = useSelector((state: IState) => state.pages.users.loading);
  const rolesMap = useSelector(getRolesMap);
  const rolesOptions = useSelector(getRolesOptions);
  const citiesMap = useSelector(getCitiesMap);

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
            rolesOptions,
            tableState,
          ),
    [navigate, rolesMap, rolesOptions, tableState, citiesMap],
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
          loading={isLoading}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
