"use client";

import {
  Alert,
  Breadcrumb,
  Button,
  Layout,
  Segmented,
  Table,
  Tooltip,
} from "antd";
import { ApartmentOutlined, UnorderedListOutlined } from "@ant-design/icons";
import * as React from "react";
import { worksDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { WorksFilters } from "./components/filters";
import "./works.page.less";
import { useNavigate, Link } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { worksMobileColumns } from "./components/mobile.columns";
import type { IWorksListColumn } from "../../interfaces/works/IWorksList";
import type { WorksFiltersState } from "../../interfaces/works/IWorksFiltersState";
import type { IState } from "../../store/modules";
import { getCurrentRole } from "../../store/modules/auth";
import {
  saveWorksFiltersState,
  saveWorksViewMode,
} from "../../store/modules/settings/works";
import { useWorksMap } from "../../queries/works";
import { useWorkCategoriesQuery } from "../../queries/workCategories";
import { WorksActions } from "./components/actions";
import { ImportWorks } from "./components/import";
import { WorksTreeTable } from "./components/WorksTreeTable";
import {
  getDescendantCategoryIds,
  workCategoryOptions,
} from "../../utils/workCategoryTree";
import { RoleId } from "../../interfaces/roles/IRole";

export const Works = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [importMode, setImportMode] = React.useState(false);
  const {
    works,
    isPending,
    isFetching,
    isError: worksError,
    refetch: refetchWorks,
  } = useWorksMap();
  const categoriesQuery = useWorkCategoriesQuery();
  const workCategoriesData = categoriesQuery.data;
  const filtersState = useSelector(
    (state: IState) => state.settings.worksSettings.worksFilters,
  );
  const viewMode = useSelector(
    (state: IState) => state.settings.worksSettings.viewMode ?? "list",
  );

  const worksData: IWorksListColumn[] = React.useMemo(
    () =>
      (works ?? []).map((doc, index) => ({
        ...doc,
        key: doc.work_id ?? `work-${index}`,
      })),
    [works],
  );

  const isLoading = isPending || isFetching;
  const currentRole = useSelector(getCurrentRole);
  const workCategoriesOptions = React.useMemo(
    () => workCategoryOptions(workCategoriesData ?? []),
    [workCategoriesData],
  );
  const categoryScope = React.useMemo(
    () =>
      filtersState.categoryId
        ? getDescendantCategoryIds(
            workCategoriesData ?? [],
            filtersState.categoryId,
          )
        : null,
    [workCategoriesData, filtersState.categoryId],
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
      const matchesCategory = categoryScope
        ? categoryScope.has(work.category.work_category_id)
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
      const price = work.work_prices?.find(
        (item) => item.category === category,
      )?.price;
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
  }, [worksData, filtersState, categoryScope]);
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
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Работы" },
        ]}
      />
      <Content className="works__content">
        <WorksActions
          works={worksData}
          onImportClick={() => setImportMode(true)}
        />

        {importMode ? (
          <ImportWorks works={worksData} onClose={() => setImportMode(false)} />
        ) : (
          <>
            <div className="works__toolbar">
              <WorksFilters
                filtersState={filtersState}
                onFiltersChange={handleFiltersChange}
                workCategoriesOptions={workCategoriesOptions}
                treeMode={viewMode === "tree"}
              />
              <Segmented
                className="works__view-mode"
                aria-label="Режим просмотра работ"
                value={viewMode}
                options={[
                  {
                    label: (
                      <Tooltip title="Список">
                        <UnorderedListOutlined aria-label="Список" />
                      </Tooltip>
                    ),
                    value: "list",
                  },
                  {
                    label: (
                      <Tooltip title="Дерево">
                        <ApartmentOutlined aria-label="Дерево" />
                      </Tooltip>
                    ),
                    value: "tree",
                  },
                ]}
                onChange={(value) =>
                  dispatch(saveWorksViewMode(value as "list" | "tree"))
                }
              />
            </div>
            {(worksError ||
              (viewMode === "tree" && categoriesQuery.isError)) && (
              <Alert
                type="error"
                showIcon
                message="Не удалось загрузить справочник работ"
                action={
                  <Button
                    onClick={() => {
                      void refetchWorks();
                      void categoriesQuery.refetch();
                    }}
                  >
                    Повторить
                  </Button>
                }
              />
            )}
            {viewMode === "tree" ? (
              <WorksTreeTable
                categories={workCategoriesData ?? []}
                works={worksData}
                filters={filtersState}
                columns={columns}
                loading={
                  isLoading ||
                  categoriesQuery.isPending ||
                  categoriesQuery.isFetching
                }
                canEdit={
                  currentRole === RoleId.ADMIN &&
                  !isMobile() &&
                  window.matchMedia("(pointer: fine)").matches &&
                  !categoriesQuery.isError &&
                  !worksError
                }
              />
            ) : (
              <Table
                pagination={false}
                dataSource={filteredWorksData}
                columns={columns}
                loading={isLoading}
              />
            )}
          </>
        )}
      </Content>
    </>
  );
};
