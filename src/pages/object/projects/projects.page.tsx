import { Table } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./projects.page.less";
import { useNavigate } from "react-router-dom";
import { projectsDesktopColumns } from "./components/desktop.columns";
import { projectsMobileColumns } from "./components/mobile.columns";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";
import type { IState } from "../../../store/modules";
import type { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";
import { isMobile } from "../../../utils/isMobile";
import { useUsersMap } from "../../../queries/users";
import { useProjectsMap } from "../../../queries/projects";
import { ObjectProjectsFilters } from "./ObjectProjectsFilters";
import type {
  IObjectProjectsFiltersState,
  ObjectProjectsSortField,
} from "../../../interfaces/projects/IObjectProjectsFiltersState";
import {
  defaultObjectProjectsFiltersState,
} from "../../../interfaces/projects/IObjectProjectsFiltersState";
import { saveObjectProjectsFiltersState } from "../../../store/modules/settings/objectProjects";

interface ProjectsProps {
  object_id: string;
}

export const Projects: React.FC<ProjectsProps> = ({ object_id }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentRole = useSelector(getCurrentRole);
  const canCreate = currentRole !== RoleId.USER;

  const { projects, isPending, isFetching } = useProjectsMap();
  const projectsData = React.useMemo<IProjectsListColumn[]>(
    () =>
      (projects ?? [])
        .filter((doc) => doc.object === object_id)
        .map((doc) => ({ ...doc, key: doc.project_id })),
    [projects, object_id],
  );

  const { usersMap } = useUsersMap();

  const filtersState = useSelector((state: IState) => {
    const filtersByObject =
      state.settings.objectProjectsSettings.filtersByObject;
    return (
      filtersByObject[object_id] ?? defaultObjectProjectsFiltersState
    );
  });

  const handleFiltersChange = React.useCallback(
    (nextFilters: IObjectProjectsFiltersState) => {
      dispatch(
        saveObjectProjectsFiltersState({
          objectId: object_id,
          filters: nextFilters,
        }),
      );
    },
    [dispatch, object_id],
  );

  const leaderOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ label: string; value: string }> = [];
    projectsData.forEach((project) => {
      const leaderId = project.project_leader;
      if (leaderId && !seen.has(leaderId)) {
        seen.add(leaderId);
        options.push({
          label: usersMap[leaderId]?.name ?? leaderId,
          value: leaderId,
        });
      }
    });
    return options;
  }, [projectsData, usersMap]);

  const filteredProjectsData = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = projectsData.filter((project) => {
      const name = project.name?.toLowerCase() ?? "";
      const leaderName =
        usersMap[project.project_leader]?.name?.toLowerCase() ?? "";

      const matchesSearch = searchValue
        ? name.includes(searchValue) || leaderName.includes(searchValue)
        : true;
      const matchesLeader = filtersState.leaderId
        ? project.project_leader === filtersState.leaderId
        : true;

      return matchesSearch && matchesLeader;
    });

    const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
    const compareText = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }) * direction;

    return filtered.sort((a, b) => {
      const sortField: ObjectProjectsSortField = filtersState.sortField;
      switch (sortField) {
        case "leader":
          return compareText(
            usersMap[a.project_leader]?.name ?? "",
            usersMap[b.project_leader]?.name ?? "",
          );
        case "name":
        default:
          return compareText(a.name ?? "", b.name ?? "");
      }
    });
  }, [projectsData, filtersState, usersMap]);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? projectsMobileColumns(navigate, usersMap)
        : projectsDesktopColumns(navigate, usersMap),
    [navigate, usersMap],
  );

  return (
    <>
      <ObjectProjectsFilters
        filtersState={filtersState}
        onFiltersChange={handleFiltersChange}
        leadersOptions={leaderOptions}
        canCreate={canCreate}
        objectId={object_id}
      />
      <Table
        dataSource={filteredProjectsData}
        columns={columns}
        loading={isPending || isFetching}
        pagination={false}
      />
    </>
  );
};
