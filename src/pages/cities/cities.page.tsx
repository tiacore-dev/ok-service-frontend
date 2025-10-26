import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./cities.page.less";
import { isMobile } from "../../utils/isMobile";
import { minPageHeight } from "../../utils/pageSettings";
import { citiesDesktopColumns } from "./components/desktop.columns";
import { citiesMobileColumns } from "./components/mobile.columns";
import { ICitiesListColumn } from "../../interfaces/cities/ICitiesList";
import { saveCitiesTableState } from "../../store/modules/settings/cities";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { Link } from "react-router-dom";
import { useCitiesQuery, useDeleteCityMutation } from "../../queries/cities";
import { useUsersMap } from "../../queries/users";

export const Cities = () => {
  const { Content } = Layout;
  const { usersMap } = useUsersMap();
  const dispatch = useDispatch();
  const { data: citiesList, isFetching } = useCitiesQuery();

  const citiesData: ICitiesListColumn[] = React.useMemo(
    () =>
      (citiesList ?? [])
        .filter((doc) => !doc.deleted)
        .map((doc) => ({
          ...doc,
          key: doc.city_id,
        })),
    [citiesList],
  );

  const tableState = useSelector(
    (state: IState) => state.settings.citiesSettings,
  );
  const currentRole = useSelector(getCurrentRole);
  const canManage = currentRole === RoleId.ADMIN;
  const mobile = isMobile();
  const { mutateAsync: deleteCityMutation } = useDeleteCityMutation();
  const handleDeleteCity = React.useCallback(
    (cityId: string) => {
      deleteCityMutation(cityId);
    },
    [deleteCityMutation],
  );

  const columns = React.useMemo(
    () =>
      mobile
        ? citiesMobileColumns(usersMap, (id) => handleDeleteCity(id), canManage)
        : citiesDesktopColumns(
            usersMap,
            (id) => handleDeleteCity(id),
            canManage,
            tableState,
          ),
    [mobile, usersMap, handleDeleteCity, canManage, tableState],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={mobile && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Города" },
        ]}
      />
      <Content
        style={{
          padding: mobile ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        {canManage && <Filters />}
        <Table
          dataSource={citiesData}
          columns={columns}
          loading={isFetching}
          pagination={tableState.pagination}
          onChange={(pagination, filters, sorter) => {
            dispatch(
              saveCitiesTableState({
                pagination,
                filters,
                sorter: Array.isArray(sorter) ? sorter[0] : sorter,
              }),
            );
          }}
        />
      </Content>
    </>
  );
};
