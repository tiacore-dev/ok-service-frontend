import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IProjectWorksList } from "../../../../interfaces/projectWorks/IProjectWorksList";
import { IWorksList } from "../../../../interfaces/works/IWorksList";

export const getProjectWorksByProjectId = createSelector(
  [
    // (state: IState) => state.pages.works.data,
    (state: IState) => state.pages.projectWorks.data,
    (_, project_id?: string) => project_id,
  ],
  (
    // works,
    projectWorks,
    project_id,
  ) => {
    if (!project_id) {
      return [];
    }

    return projectWorks.filter((el) => el.project === project_id);
    // const workIds = projectWorks
    //   .filter((el) => el.project === project_id)
    //   .map((el) => el.work);
    // return works.filter((el) => workIds.includes(el.work_id));
  },
);

export const getProjectWorksMapByProjectId = createSelector(
  [
    (state: IState) => state.pages.projectWorks.data,
    (_, project_id?: string) => project_id,
  ],
  (projectWorks, project_id) => {
    if (!project_id) {
      return {} as Record<string, IProjectWorksList>;
    }

    const projectWorksByProjectId = projectWorks.filter(
      (el) => el.project === project_id,
    );

    const map: Record<string, IProjectWorksList> = {};
    projectWorksByProjectId.forEach(
      (projectWork) => (map[projectWork.project_work_id] = projectWork),
    );
    return map;
  },
);

export const getWorksState = createSelector(
  [(state: IState) => state.pages.works],
  (works) => works,
);

export const getWorksData = createSelector(
  [(state: IState) => state.pages.works.data],
  (works) => works,
);

export const getWorksMap = createSelector(
  [(state: IState) => state.pages.works.data],
  (works) => {
    const map: Record<string, IWorksList> = {};
    works.forEach((work) => (map[work.work_id] = work));
    return map;
  },
);
