import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IProject } from "../../../../interfaces/projects/IProject";

export const getProjectsMap = createSelector(
  [(state: IState) => state.pages.projects.data],
  (projects) => {
    const map: Record<string, IProject> = {};
    projects.forEach((project) => (map[project.project_id] = project));
    return map;
  }
);
