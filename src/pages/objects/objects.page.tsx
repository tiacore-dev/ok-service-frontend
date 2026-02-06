import { Breadcrumb, Layout, Table } from "antd";
import type { TableProps } from "antd";
import * as React from "react";
import { objectsDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./objects.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { objectsMobileColumns } from "./components/mobile.columns";
import { IObjectsListColumn } from "../../interfaces/objects/IObjectsList";
import { Link } from "react-router-dom";
import { useUsersMap } from "../../queries/users";
import {
  saveObjectsFiltersState,
  saveObjectsTableState,
} from "../../store/modules/settings/objects";
import { useObjectsQuery } from "../../queries/objects";
import { useObjectStatuses } from "../../queries/objectStatuses";
import { useCitiesMap } from "../../queries/cities";
import type { IObjectsFiltersState } from "../../interfaces/objects/IObjectsFiltersState";
import { Actions } from "./components/actions";

export const Objects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const { usersMap } = useUsersMap();
  const { data: objectsList, isFetching } = useObjectsQuery();

  const tableState = useSelector(
    (state: IState) => state.settings.objectsSettings,
  );
  const dispatch = useDispatch();

  const objectsData: IObjectsListColumn[] = React.useMemo(
    () =>
      (objectsList ?? []).map((doc) => ({
        ...doc,
        key: doc.object_id,
      })),
    [objectsList],
  );
  const { statusMap, statusOptions } = useObjectStatuses();
  const { citiesMap, cityOptions } = useCitiesMap();
  const filtersState = useSelector(
    (state: IState) => state.settings.objectsSettings.objectsFilters,
  );

  const handleTableChange: TableProps<IObjectsListColumn>["onChange"] = (
    pagination,
    filters,
    sorter,
  ) => {
    dispatch(
      saveObjectsTableState({
        pagination,
        filters,
        sorter: Array.isArray(sorter) ? sorter[0] : sorter,
      }),
    );
  };

  const paginationConfig = React.useMemo<
    TableProps<IObjectsListColumn>["pagination"]
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
        ? objectsMobileColumns(navigate, statusMap, citiesMap)
        : objectsDesktopColumns(navigate, statusMap, usersMap, citiesMap),
    [navigate, statusMap, usersMap, citiesMap],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: IObjectsFiltersState) => {
      dispatch(saveObjectsFiltersState(nextFilters));
    },
    [dispatch],
  );

  const statusSelectOptions = React.useMemo(
    () =>
      statusOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [statusOptions],
  );

  const citySelectOptions = React.useMemo(
    () =>
      cityOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [cityOptions],
  );

  const managerSelectOptions = React.useMemo(() => {
    return Object.values(usersMap).map((user) => ({
      label: user.name,
      value: user.user_id ?? user.name,
    }));
  }, [usersMap]);

  const filteredObjectsData: IObjectsListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = objectsData.filter((object) => {
      const name = (object.name ?? "").toLowerCase();
      const address = (object.address ?? "").toLowerCase();
      const description = (object.description ?? "").toLowerCase();
      const managerName = (usersMap[object.manager]?.name ?? "").toLowerCase();

      const matchesSearch = searchValue
        ? name.includes(searchValue) ||
          address.includes(searchValue) ||
          description.includes(searchValue) ||
          managerName.includes(searchValue)
        : true;
      const matchesStatus = filtersState.statusId
        ? object.status === filtersState.statusId
        : true;
      const matchesCity = filtersState.cityId
        ? object.city === filtersState.cityId
        : true;
      const matchesManager = filtersState.managerId
        ? object.manager === filtersState.managerId
        : true;

      return matchesSearch && matchesStatus && matchesCity && matchesManager;
    });

    const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
    const compareText = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }) * direction;

    return filtered.sort((a, b) => {
      switch (filtersState.sortField) {
        case "city":
          return compareText(
            a.city ? citiesMap[a.city]?.name ?? "" : "",
            b.city ? citiesMap[b.city]?.name ?? "" : "",
          );
        case "status":
          return compareText(
            statusMap[a.status]?.name ?? "",
            statusMap[b.status]?.name ?? "",
          );
        case "manager":
          return compareText(
            usersMap[a.manager]?.name ?? "",
            usersMap[b.manager]?.name ?? "",
          );
        case "name":
        default:
          return compareText(a.name ?? "", b.name ?? "");
      }
    });
  }, [objectsData, filtersState, usersMap, citiesMap, statusMap]);
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Объекты" },
        ]}
      />
      <Content className="objects">
        <Actions />
        <Filters
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
          statusOptions={statusSelectOptions}
          cityOptions={citySelectOptions}
          managerOptions={managerSelectOptions}
        />
        <Table
          dataSource={filteredObjectsData}
          columns={columns}
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
