import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IObjectStatus } from "../../../../interfaces/objectStatuses/IObjectStatus";

export const getObjectStatuses = createSelector(
  [(state: IState) => state.dictionaries.objectStatuses.data],
  (objectStatuses) => objectStatuses
);

export const getObjectStatusesMap = createSelector(
  [(state: IState) => state.dictionaries.objectStatuses.data],
  (objectStatuses) => {
    const map: Record<string, IObjectStatus> = {};
    objectStatuses.forEach(
      (objectStatus) => (map[objectStatus.object_status_id] = objectStatus)
    );
    return map;
  }
);

export const getObjectStatusesOptions = createSelector(
  [(state: IState) => state.dictionaries.objectStatuses.data],
  (objectStatuses) =>
    objectStatuses.map((el) => ({ text: el.name, value: el.object_status_id }))
);
