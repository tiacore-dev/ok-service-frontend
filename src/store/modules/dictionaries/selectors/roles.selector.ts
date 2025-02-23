import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IRole } from "../../../../interfaces/roles/IRole";

export const getRoles = createSelector(
  [(state: IState) => state.dictionaries.roles.data],
  (roles) => roles
);

export const getRolesMap = createSelector(
  [(state: IState) => state.dictionaries.roles.data],
  (roles) => {
    const map: Record<string, IRole> = {};
    roles.forEach((role) => (map[role.role_id] = role));
    return map;
  }
);

export const getRolesOptions = createSelector(
  [(state: IState) => state.dictionaries.roles.data],
  (roles) => roles.map((el) => ({ text: el.name, value: el.role_id }))
);
