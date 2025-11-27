"use client";

import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { worksDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { Filters } from "./components/filters";
import "./works.page.less";
import { useNavigate, Link } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { worksMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import type { IWorksListColumn } from "../../interfaces/works/IWorksList";
import type { WorksFiltersState } from "../../interfaces/works/IWorksFiltersState";
import type { IState } from "../../store/modules";
import { getCurrentRole } from "../../store/modules/auth";
import { saveWorksFiltersState } from "../../store/modules/settings/works";
import { useWorksMap } from "../../queries/works";
import { useWorkCategoriesQuery } from "../../queries/workCategories";

export const Works = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { works, isPending, isFetching } = useWorksMap();
  const { data: workCategoriesData } = useWorkCategoriesQuery();
  const filtersState = useSelector(
    (state: IState) => state.settings.worksSettings.worksFilters,
  );

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
        label: category.name,
        value: category.work_category_id,
      })),
    [workCategoriesData],
  );
  const handleFiltersChange = React.useCallback(
    (nextFilters: WorksFiltersState) => {
      dispatch(saveWorksFiltersState(nextFilters));
    },
    [dispatch],
  );
  const filteredWorksData: IWorksListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = worksData.filter((work) => {
      const matchesSearch = searchValue
        ? work.name.toLowerCase().includes(searchValue)
        : true;
      const matchesCategory = filtersState.categoryId
        ? work.category.work_category_id === filtersState.categoryId
        : true;
      const matchesDeleted =
        filtersState.deletedFilter === "all"
          ? true
          : filtersState.deletedFilter === "active"
            ? !work.deleted
            : Boolean(work.deleted);

      return matchesSearch && matchesCategory && matchesDeleted;
    });

    const getPriceByCategory = (work: IWorksListColumn, category: number) => {
      const price = work.work_prices?.find((item) => item.category === category)
        ?.price;
      return typeof price === "number" ? price : null;
    };

    const sorted = [...filtered].sort((a, b) => {
      const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
      const sortField = filtersState.sortField;

      const compareText = (first: string, second: string) =>
        first.localeCompare(second, undefined, { sensitivity: "base" }) *
        direction;

      if (sortField === "name") {
        return compareText(a.name ?? "", b.name ?? "");
      }

      if (sortField === "category") {
        return compareText(a.category.name, b.category.name);
      }

      const categoryNumber = Number(sortField.replace("price", ""));
      if (Number.isNaN(categoryNumber) || categoryNumber <= 0) {
        return 0;
      }
      const aPrice = getPriceByCategory(a, categoryNumber);
      const bPrice = getPriceByCategory(b, categoryNumber);

      if (aPrice === null && bPrice === null) {
        return 0;
      }

      if (aPrice === null) {
        return 1 * direction;
      }

      if (bPrice === null) {
        return -1 * direction;
      }

      if (aPrice === bPrice) {
        return 0;
      }

      return aPrice > bPrice ? direction : -direction;
    });

    return sorted;
  }, [worksData, filtersState]);
  const columns = React.useMemo(
    () =>
      isMobile()
        ? worksMobileColumns(navigate, currentRole)
        : worksDesktopColumns(navigate, currentRole),
    [navigate, currentRole],
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
        <Filters
          works={worksData}
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
          workCategoriesOptions={workCategoriesOptions}
        />
        <Table
          pagination={false}
          dataSource={filteredWorksData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
