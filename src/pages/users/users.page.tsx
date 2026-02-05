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
import {
  saveUsersFiltersState,
  saveUsersTableState,
} from "../../store/modules/settings/users";
import { useUsersQuery } from "../../queries/users";
import { useRoles } from "../../queries/roles";
import { useCitiesMap } from "../../queries/cities";
import { categoryMap } from "../../utils/categoryMap";
import type { IUsersFiltersState } from "../../interfaces/users/IUsersFiltersState";

export const Users = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const { data: usersList, isFetching } = useUsersQuery();

  const tableState = useSelector(
    (state: IState) => state.settings.usersSettings,
  );
  const dispatch = useDispatch();

  const usersData: IUsersListColumn[] = React.useMemo(
    () => (usersList ?? []).map((doc) => ({ ...doc, key: doc.user_id })),
    [usersList],
  );
  const { rolesMap, roleOptions } = useRoles();
  const { citiesMap, cityOptions } = useCitiesMap();
  const filtersState = useSelector(
    (state: IState) => state.settings.usersSettings.usersFilters,
  );

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
        : usersDesktopColumns(navigate, rolesMap, citiesMap),
    [navigate, rolesMap, citiesMap],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: IUsersFiltersState) => {
      dispatch(saveUsersFiltersState(nextFilters));
    },
    [dispatch],
  );

  const categoryOptions = React.useMemo(
    () =>
      categoryMap.map((category) => ({
        label: category.label,
        value: category.value,
      })),
    [],
  );

  const roleSelectOptions = React.useMemo(
    () =>
      roleOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [roleOptions],
  );

  const citySelectOptions = React.useMemo(
    () =>
      cityOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [cityOptions],
  );

  const filteredUsersData: IUsersListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = usersData.filter((user) => {
      const matchesSearch = searchValue
        ? user.name.toLowerCase().includes(searchValue) ||
          user.login.toLowerCase().includes(searchValue)
        : true;
      const matchesRole = filtersState.roleId
        ? user.role === filtersState.roleId
        : true;
      const matchesCity = filtersState.cityId
        ? user.city === filtersState.cityId
        : true;
      const matchesCategory =
        filtersState.category !== null && filtersState.category !== undefined
          ? user.category === filtersState.category
          : true;
      const matchesDeleted =
        filtersState.deletedFilter === "all"
          ? true
          : filtersState.deletedFilter === "deleted"
            ? user.deleted
            : !user.deleted;

      return (
        matchesSearch &&
        matchesRole &&
        matchesCity &&
        matchesCategory &&
        matchesDeleted
      );
    });

    const compareText = (first: string, second: string, direction: number) =>
      first.localeCompare(second, undefined, { sensitivity: "base" }) *
      direction;

    const sorted = [...filtered].sort((a, b) => {
      const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
      switch (filtersState.sortField) {
        case "login":
          return compareText(a.login ?? "", b.login ?? "", direction);
        case "category":
          return ((a.category ?? -1) - (b.category ?? -1)) * direction;
        case "role":
          return compareText(
            rolesMap[a.role]?.name ?? "",
            rolesMap[b.role]?.name ?? "",
            direction,
          );
        case "city":
          return compareText(
            a.city ? citiesMap[a.city]?.name ?? "" : "",
            b.city ? citiesMap[b.city]?.name ?? "" : "",
            direction,
          );
        case "name":
        default:
          return compareText(a.name ?? "", b.name ?? "", direction);
      }
    });

    return sorted;
  }, [usersData, filtersState, rolesMap, citiesMap]);

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
        className="users"
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <Filters
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
          roleOptions={roleSelectOptions}
          cityOptions={citySelectOptions}
          categoryOptions={categoryOptions}
        />
        <Table
          dataSource={filteredUsersData}
          columns={columns}
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
          rowClassName={(record) =>
            record.deleted ? "users__table__row--deleted" : ""
          }
        />
      </Content>
    </>
  );
};
