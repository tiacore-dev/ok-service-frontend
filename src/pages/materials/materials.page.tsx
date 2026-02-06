"use client";

import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { materialsDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { MaterialsFilters } from "./components/filters";
import "./materials.page.less";
import { useNavigate, Link } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { materialsMobileColumns } from "./components/mobile.columns";
import type { IMaterialsListColumn } from "../../interfaces/materials/IMaterialsList";
import type { MaterialsFiltersState } from "../../interfaces/materials/IMaterialsFiltersState";
import type { IState } from "../../store/modules";
import { getCurrentRole } from "../../store/modules/auth";
import { saveMaterialsFiltersState } from "../../store/modules/settings/materials";
import { useMaterialsMap } from "../../queries/materials";
import { MaterialsActions } from "./components/actions";

export const Materials = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { materials, isPending, isFetching } = useMaterialsMap();
  const filtersState = useSelector(
    (state: IState) => state.settings.materialsSettings.materialsFilters,
  );

  const materialsData: IMaterialsListColumn[] = React.useMemo(
    () =>
      (materials ?? []).map((doc) => ({
        ...doc,
        key: doc.material_id,
      })),
    [materials],
  );

  const isLoading = isPending || isFetching;
  const currentRole = useSelector(getCurrentRole);

  const handleFiltersChange = React.useCallback(
    (nextFilters: MaterialsFiltersState) => {
      dispatch(saveMaterialsFiltersState(nextFilters));
    },
    [dispatch],
  );

  const filteredMaterialsData: IMaterialsListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = materialsData.filter((material) => {
      const matchesSearch = searchValue
        ? material.name.toLowerCase().includes(searchValue)
        : true;
      const matchesDeleted =
        filtersState.deletedFilter === "all"
          ? true
          : filtersState.deletedFilter === "active"
            ? !material.deleted
            : Boolean(material.deleted);

      return matchesSearch && matchesDeleted;
    });

    const sorted = [...filtered].sort((a, b) => {
      const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
      const compareText = (first: string, second: string) =>
        first.localeCompare(second, undefined, { sensitivity: "base" }) *
        direction;

      if (filtersState.sortField === "measurement_unit") {
        return compareText(
          a.measurement_unit ?? "",
          b.measurement_unit ?? "",
        );
      }

      if (filtersState.sortField === "created_at") {
        const aValue = a.created_at ?? 0;
        const bValue = b.created_at ?? 0;
        return (aValue - bValue) * direction;
      }

      return compareText(a.name ?? "", b.name ?? "");
    });

    return sorted;
  }, [materialsData, filtersState]);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? materialsMobileColumns(navigate, currentRole)
        : materialsDesktopColumns(navigate, currentRole),
    [navigate, currentRole],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Материалы" },
        ]}
      />
      <Content className="materials">
        <MaterialsActions />

        <MaterialsFilters
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
        />
        <Table
          pagination={false}
          dataSource={filteredMaterialsData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
