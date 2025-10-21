import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IWorksList } from "../../../../interfaces/works/IWorksList";

export const getWorksState = createSelector(
  [(state: IState) => state.pages.works],
  (works) => works,
);

export const getWorksData = createSelector(
  [
    (state: IState) => state.pages.works.data,
    (state: IState, notDeleted?: boolean) => notDeleted,
  ],
  (works, notDeleted) => works.filter((work) => !work.deleted || !notDeleted),
);

export const getWorksMap = createSelector(
  [(state: IState) => state.pages.works.data],
  (works) => {
    const map: Record<string, IWorksList> = {};
    works.forEach((work) => (map[work.work_id] = work));
    return map;
  },
);
