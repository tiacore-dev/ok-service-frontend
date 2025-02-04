import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getWorksByProjectId = createSelector(
  [
    (state: IState) => state.pages.works.data,
    (state: IState) => state.pages.projectWorks.data,
    (_, project_id?: string) => project_id,
  ],
  (works, projectWorks, project_id) => {
    if (!project_id) {
      return [];
    }
    const workIds = projectWorks
      .filter((el) => el.project === project_id)
      .map((el) => el.work);
    return works.filter((el) => workIds.includes(el.work_id));
  }
);


export const getWorksState = createSelector(
  [(state: IState) => state.pages.works],
  (works) => works
);

export const getWorksData = createSelector(
  [(state: IState) => state.pages.works.data],
  (works) => works
);
