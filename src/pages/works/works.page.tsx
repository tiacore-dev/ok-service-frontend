"use client";

import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { worksDesktopColumns } from "./components/desktop.columns";
import { useSelector, useDispatch } from "react-redux";
import type { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./works.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { worksMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import type { IWorksListColumn } from "../../interfaces/works/IWorksList";
import { Link } from "react-router-dom";
import { useWorks } from "../../hooks/ApiActions/works";
import { getCurrentRole } from "../../store/modules/auth";
import { getWorkCategoriesOptions } from "../../store/modules/dictionaries/selectors/work-categories.selector";
import { saveWorksTableState } from "../../store/modules/settings/works";

export const Works = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.worksSettings.filters
  );
  const tableState = useSelector(
    (state: IState) => state.settings.worksSettings
  );
  const dispatch = useDispatch();

  const { getWorks } = useWorks();

  React.useEffect(() => {
    getWorks();
  }, [filters]);

  const worksData: IWorksListColumn[] = useSelector(
    (state: IState) => state.pages.works.data
  ).map((doc) => ({
    ...doc,
    key: doc.work_id,
  }));

  const isLoading = useSelector((state: IState) => state.pages.works.loading);
  const currentRole = useSelector(getCurrentRole);
  const workCategoriesOptions = useSelector(getWorkCategoriesOptions);
  const columns = React.useMemo(
    () =>
      isMobile()
        ? worksMobileColumns(navigate, currentRole)
        : worksDesktopColumns(
            navigate,
            currentRole,
            workCategoriesOptions,
            tableState
          ),
    [navigate, workCategoriesOptions, currentRole, tableState]
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Работы" },
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
          pagination={false}
          dataSource={worksData}
          columns={columns}
          loading={isLoading}
          onChange={(pagination, filters, sorter) => {
            dispatch(
              saveWorksTableState({
                pagination,
                filters,
                sorter: Array.isArray(sorter) ? sorter[0] : sorter,
              })
            );
          }}
        />
      </Content>
    </>
  );
};
