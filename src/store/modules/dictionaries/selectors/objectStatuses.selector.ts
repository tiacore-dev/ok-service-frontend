import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getObjectStatuses = createSelector(
  [(state: IState) => state.dictionaries.objectStatuses.data],
  (objectStatuses) => objectStatuses
);
