import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getRoles = createSelector(
  [(state: IState) => state.dictionaries.roles.data],
  (roles) => roles
);
