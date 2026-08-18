"use client";

import { Breadcrumb, Layout, Table, type TablePaginationConfig } from "antd";
import * as React from "react";
import { shiftReportsDesktopColumns } from "./components/desktop.columns";
import { shiftReportsMobileColumns } from "./components/mobile.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import "./shiftReports.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { DataNode } from "antd/es/tree";
import {
  saveShiftReportsFiltersState,
  saveShiftReportsTableState,
} from "../../store/modules/settings/shift-reports";
import { useShiftReportsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import type { IShiftReportQueryParams } from "../../interfaces/shiftReports/IShiftReport";
import type {
  IShiftReportsList,
  IShiftReportsListColumn,
} from "../../interfaces/shiftReports/IShiftReportsList";
import { Actions } from "./components/actions";
import { useUsersMap } from "../../queries/users";
import { useObjectsMap } from "../../queries/objects";
import { useProjectsMap } from "../../queries/projects";
import { usePlacesQuery } from "../../queries/places";
import { ShiftReportsFilters } from "./ShiftReportsFilters";
import type { IShiftReportsFiltersState } from "../../interfaces/shiftReports/IShiftReportsFiltersState";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const ShiftReports = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentRole = useSelector(getCurrentRole);

  const tableState = useSelector(
    (state: IState) => state.settings.shiftReportsSettings,
  );

  const shiftReportsFilters = tableState.shiftReportsFilters;
  const selectedPlaceIds = shiftReportsFilters.places ?? [];

  const { projectsMap, projects } = useProjectsMap();
  const { objectsMap } = useObjectsMap();
  const { usersMap } = useUsersMap();
  const { data: places = [] } = usePlacesQuery();

  const handleFiltersChange = React.useCallback(
    (nextFilters: IShiftReportsFiltersState) => {
      dispatch(saveShiftReportsFiltersState(nextFilters));
      dispatch(
        saveShiftReportsTableState({
          pagination: {
            ...(tableState.pagination || {}),
            current: 1,
          },
          filters: tableState.filters,
          sorter: tableState.sorter,
          shiftReportsFilters: nextFilters,
        }),
      );
    },
    [dispatch, tableState],
  );

  const projectLeaderProjectIds = React.useMemo(() => {
    if (!shiftReportsFilters.projectLeaders.length) {
      return [];
    }
    const leaderIds = new Set(shiftReportsFilters.projectLeaders);
    return projects
      .filter(
        (project) =>
          project.project_id && leaderIds.has(project.project_leader),
      )
      .map((project) => project.project_id as string);
  }, [projects, shiftReportsFilters.projectLeaders]);

  const resolvedProjectFilter = React.useMemo(() => {
    if (!shiftReportsFilters.projectLeaders.length) {
      return shiftReportsFilters.projects;
    }

    if (!shiftReportsFilters.projects.length) {
      return projectLeaderProjectIds;
    }

    const selected = new Set(shiftReportsFilters.projects);
    return projectLeaderProjectIds.filter((projectId) =>
      selected.has(projectId),
    );
  }, [
    projectLeaderProjectIds,
    shiftReportsFilters.projectLeaders,
    shiftReportsFilters.projects,
  ]);

  const queryParams: IShiftReportQueryParams = React.useMemo(() => {
    const pageSize = tableState.pagination?.pageSize || 20;
    const params: IShiftReportQueryParams = {
      offset: tableState.pagination?.current
        ? (tableState.pagination.current - 1) * pageSize
        : 0,
      limit: pageSize,
    };

    if (tableState.sorter?.field) {
      params.sort_by = tableState.sorter.field as string;
      params.sort_order = tableState.sorter.order === "ascend" ? "asc" : "desc";
    }

    if (shiftReportsFilters.users.length) {
      params.user = shiftReportsFilters.users;
    }

    if (shiftReportsFilters.projectLeaders.length) {
      params.project =
        resolvedProjectFilter.length > 0 ? resolvedProjectFilter : [null];
    } else if (shiftReportsFilters.projects.length) {
      params.project = shiftReportsFilters.projects;
    }

    if (shiftReportsFilters.dateFrom) {
      params.date_from = shiftReportsFilters.dateFrom;
    }
    if (shiftReportsFilters.dateTo) {
      params.date_to = shiftReportsFilters.dateTo;
    }
    if (selectedPlaceIds.length) {
      params.place_id = selectedPlaceIds;
    }

    return params;
  }, [selectedPlaceIds, tableState, shiftReportsFilters, resolvedProjectFilter]);

  const placesByObject = React.useMemo(() => {
    return places
      .filter((place) => !place.deleted)
      .reduce<Record<string, typeof places>>((acc, place) => {
        if (!acc[place.object_id]) acc[place.object_id] = [];
        acc[place.object_id].push(place);
        return acc;
      }, {});
  }, [places]);

  const placesNamesMap = React.useMemo<Record<string, string>>(
    () =>
      places.reduce<Record<string, string>>((acc, place) => {
        acc[place.place_id] = `${objectsMap[place.object_id]?.name ?? "Объект"} — ${place.name}`;
        return acc;
      }, {}),
    [objectsMap, places],
  );

  const placesTreeData = React.useMemo<DataNode[]>(
    () =>
      Object.entries(placesByObject)
        .map(([objectId, objectPlaces]) => ({
          title: objectsMap[objectId]?.name ?? "Без названия",
          value: `place-object:${objectId}`,
          key: `place-object:${objectId}`,
          children: objectPlaces.map((place) => ({
            title: place.name,
            value: place.place_id,
            key: place.place_id,
          })),
        }))
        .filter((node) => node.children.length > 0),
    [objectsMap, placesByObject],
  );

  const placesTreeValue = React.useMemo(() => {
    const values = new Set(selectedPlaceIds);
    Object.entries(placesByObject).forEach(([objectId, objectPlaces]) => {
      if (
        objectPlaces.length > 0 &&
        objectPlaces.every((place) => values.has(place.place_id))
      ) {
        values.add(`place-object:${objectId}`);
      }
    });
    return Array.from(values);
  }, [placesByObject, selectedPlaceIds]);

  const handlePlacesChange: React.ComponentProps<
    typeof ShiftReportsFilters
  >["onPlacesChange"] = (value) => {
    const rawValues = Array.isArray(value)
      ? value
      : value !== undefined && value !== null
        ? [value]
        : [];
    const selected = new Set<string>();
    rawValues.forEach((raw) => {
      const valueString = String(raw);
      if (valueString.startsWith("place-object:")) {
        const objectId = valueString.replace("place-object:", "");
        (placesByObject[objectId] ?? []).forEach((place) =>
          selected.add(place.place_id),
        );
      } else {
        selected.add(valueString);
      }
    });
    handleFiltersChange({ ...shiftReportsFilters, places: Array.from(selected) });
  };

  const { data: shiftReportsResponse, isLoading } =
    useShiftReportsQuery(queryParams);

  const tableData = React.useMemo(() => {
    if (!shiftReportsResponse?.shift_reports) return [];

    return shiftReportsResponse.shift_reports.map((doc: IShiftReportsList) => ({
      ...doc,
      key: doc.shift_report_id,
    }));
  }, [shiftReportsResponse]);

  const userOptions = React.useMemo(
    () =>
      Object.values(usersMap).map((user) => ({
        label: user.name,
        value: user.user_id,
      })),
    [usersMap],
  );

  const projectLeaderOptions = React.useMemo(
    () =>
      Object.values(usersMap)
        .filter((user) =>
          [RoleId.ADMIN, RoleId.MANAGER, RoleId.PROJECT_LEADER].includes(
            user.role,
          ),
        )
        .map((user) => ({
          label: user.name,
          value: user.user_id,
        })),
    [usersMap],
  );

  const objectProjectsMap = React.useMemo(() => {
    return projects.reduce<Record<string, string[]>>((acc, project) => {
      if (project.object && project.project_id) {
        if (!acc[project.object]) {
          acc[project.object] = [];
        }
        acc[project.object].push(project.project_id);
      }
      return acc;
    }, {});
  }, [projects]);

  const projectNamesMap = React.useMemo<Record<string, string>>(
    () =>
      Object.values(projectsMap).reduce<Record<string, string>>(
        (acc, project) => {
          if (project.project_id) {
            acc[project.project_id] = project.name;
          }
          return acc;
        },
        {},
      ),
    [projectsMap],
  );

  const projectsTreeData = React.useMemo<DataNode[]>(() => {
    return Object.entries(objectProjectsMap)
      .map<DataNode | null>(([objectId, projectIds]) => {
        const children = projectIds
          .map<DataNode | null>((projectId) => {
            const project = projectsMap[projectId];
            if (!project) return null;
            return {
              title: project.name,
              value: project.project_id,
              key: project.project_id,
            };
          })
          .filter((child): child is DataNode => Boolean(child));

        if (!children.length) {
          return null;
        }

        return {
          title: objectsMap[objectId]?.name || "Без названия",
          value: `object:${objectId}`,
          key: `object:${objectId}`,
          children,
        };
      })
      .filter((node): node is DataNode => Boolean(node));
  }, [objectProjectsMap, objectsMap, projectsMap]);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? shiftReportsMobileColumns(navigate, projectsMap, usersMap)
        : shiftReportsDesktopColumns(
            navigate,
            projectsMap,
            usersMap,
            objectsMap,
            tableState.sorter,
          ),
    [
      navigate,
      projectsMap,
      usersMap,
      objectsMap,
      tableState.sorter,
      currentRole,
    ],
  );

  const paginationConfig = React.useMemo(
    () => ({
      ...tableState.pagination,
      total: shiftReportsResponse?.total || 0,
      showSizeChanger: true,
      pageSizeOptions: ["20", "50", "100"],
    }),
    [tableState.pagination, shiftReportsResponse?.total],
  );

  const currentFilters = React.useMemo(() => {
    const projects =
      shiftReportsFilters.projectLeaders.length > 0
        ? resolvedProjectFilter.length > 0
          ? resolvedProjectFilter
          : ["__none__"]
        : shiftReportsFilters.projects;

    return {
      users: shiftReportsFilters.users,
      projects,
      date_from: shiftReportsFilters.dateFrom ?? undefined,
      date_to: shiftReportsFilters.dateTo ?? undefined,
    };
  }, [shiftReportsFilters, resolvedProjectFilter]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter:
      | SorterResult<IShiftReportsListColumn>
      | SorterResult<IShiftReportsListColumn>[],
  ) => {
    // Сохраняем текущие фильтры и объединяем с новыми
    const mergedFilters = {
      ...tableState.filters,
      ...filters,
    };

    dispatch(
      saveShiftReportsTableState({
        pagination,
        filters: mergedFilters,
        sorter: Array.isArray(sorter) ? sorter[0] : sorter,
        shiftReportsFilters,
      }),
    );
  };

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Отчеты по сменам" },
        ]}
      />
      <Content className="shift-reports">
        <Actions currentFilters={currentFilters} />

        <ShiftReportsFilters
          filtersState={shiftReportsFilters}
          onFiltersChange={handleFiltersChange}
          userOptions={userOptions}
          projectLeaderOptions={projectLeaderOptions}
          projectsTreeData={projectsTreeData}
          objectProjectsMap={objectProjectsMap}
          projectNamesMap={projectNamesMap}
          placesTreeData={placesTreeData}
          placesNamesMap={placesNamesMap}
          placesTreeValue={placesTreeValue}
          onPlacesChange={handlePlacesChange}
        />
        <Table<IShiftReportsListColumn>
          onChange={handleTableChange}
          dataSource={tableData as IShiftReportsListColumn[]}
          columns={columns}
          loading={isLoading}
          pagination={paginationConfig}
        />
      </Content>
    </>
  );
};
