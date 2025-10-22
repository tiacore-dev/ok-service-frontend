"use client";

import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { worksDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import type { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./works.page.less";
import { useNavigate, Link } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { worksMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import type { IWorksListColumn } from "../../interfaces/works/IWorksList";
import { saveWorksTableState } from "../../store/modules/settings/works";
import { getCurrentRole } from "../../store/modules/auth";
import { useWorksMap } from "../../queries/works";
import { useWorkCategoriesQuery } from "../../queries/workCategories";

export const Works = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const tableState = useSelector(
    (state: IState) => state.settings.worksSettings,
  );
  const dispatch = useDispatch();
  const { works, isPending, isFetching } = useWorksMap();
  const { data: workCategoriesData } = useWorkCategoriesQuery();

  const worksData: IWorksListColumn[] = React.useMemo(
    () =>
      (works ?? []).map((doc) => ({
        ...doc,
        key: doc.work_id,
      })),
    [works],
  );

  const isLoading = isPending || isFetching;
  const currentRole = useSelector(getCurrentRole);
  const workCategoriesOptions = React.useMemo(
    () =>
      (workCategoriesData ?? []).map((category) => ({
        text: category.name,
        value: category.work_category_id,
      })),
    [workCategoriesData],
  );
  const columns = React.useMemo(
    () =>
      isMobile()
        ? worksMobileColumns(navigate, currentRole)
        : worksDesktopColumns(
            navigate,
            currentRole,
            workCategoriesOptions,
            tableState,
          ),
    [navigate, workCategoriesOptions, currentRole, tableState],
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
              }),
            );
          }}
        />
      </Content>
    </>
  );
};
