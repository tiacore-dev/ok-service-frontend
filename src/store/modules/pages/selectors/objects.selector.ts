import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IObject } from "../../../../interfaces/objects/IObject";

export const getObjectsMap = createSelector(
  [(state: IState) => state.pages.objects.data],
  (objects) => {
    const map: Record<string, IObject> = {};
    objects.forEach((object) => (map[object.object_id] = object));
    return map;
  }
);
