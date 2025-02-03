import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getworkPricesByWorkId = createSelector(
  [
    (state: IState) => state.pages.workPrices.data,
    (_, work_id?: string) => work_id,
  ],
  (workPrices, work_id) => workPrices.filter((el) => el.work === work_id)
);
