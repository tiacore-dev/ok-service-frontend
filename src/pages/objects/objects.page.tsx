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
import { Link } from "react-router-dom";
import { useUsersMap } from "../../queries/users";
import { saveObjectsTableState } from "../../store/modules/settings/objects";
import { useObjectsQuery } from "../../queries/objects";
import { useObjectStatuses } from "../../queries/objectStatuses";
import { useCitiesMap } from "../../queries/cities";

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
            cityOptions,
            tableState,
          ),
    [
      navigate,
      statusMap,
      usersMap,
      statusOptions,
      cityOptions,
      citiesMap,
      tableState,
    ],
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
          loading={isFetching}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};
