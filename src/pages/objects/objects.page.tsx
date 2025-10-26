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
import { minPageHeight } from "../../utils/pageSettings";
import { IObjectsListColumn } from "../../interfaces/objects/IObjectsList";
import { useObjects } from "../../hooks/ApiActions/objects";
import {
  getObjectStatusesMap,
  getObjectStatusesOptions,
} from "../../store/modules/dictionaries/selectors/objectStatuses.selector";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { useUsers } from "../../hooks/ApiActions/users";
import { useCities } from "../../hooks/ApiActions/cities";
import { getCitiesMap } from "../../store/modules/pages/selectors/cities.selector";
import { saveObjectsTableState } from "../../store/modules/settings/objects";

export const Objects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.objectsSettings.filters,
  );

  const { getObjects } = useObjects();
  const { getUsers } = useUsers();
  const { getCities } = useCities();

  React.useEffect(() => {
    getObjects();
    getUsers();
    getCities();
  }, [filters]);

  const tableState = useSelector(
    (state: IState) => state.settings.objectsSettings,
  );
  const dispatch = useDispatch();

  const objectsData: IObjectsListColumn[] = useSelector(
    (state: IState) => state.pages.objects.data,
  ).map((doc) => ({
    ...doc,
    key: doc.object_id,
  }));

  const isLoading = useSelector((state: IState) => state.pages.objects.loading);
  const statusMap = useSelector(getObjectStatusesMap);
  const usersMap = useSelector(getUsersMap);
  const citiesMap = useSelector(getCitiesMap);
  const statusOptions = useSelector(getObjectStatusesOptions);

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
        : objectsDesktopColumns(
            navigate,
            statusMap,
            usersMap,
            citiesMap,
            statusOptions,
            tableState,
          ),
    [navigate, statusMap, usersMap, statusOptions, citiesMap, tableState],
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Объекты" },
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
          dataSource={objectsData}
          columns={columns}
          loading={isLoading}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
