import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IUser } from "../../../../interfaces/users/IUser";

export const getUsersMap = createSelector(
  [(state: IState) => state.pages.users.data],
  (users) => {
    const map: Record<string, IUser> = {};
    users.forEach((user) => (map[user.user_id] = user));
    return map;
  }
);
