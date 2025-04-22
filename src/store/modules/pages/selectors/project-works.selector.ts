import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getProjectWorksByProjectId = createSelector(
  [
    (state: IState) => state.pages.projectWorks.data,
    (_, project_id?: string) => project_id,
  ],

  (projectWorks, project_id) => {
    if (!project_id) {
      return [];
    }
    return projectWorks.filter((el) => el.project === project_id);
  },
);
