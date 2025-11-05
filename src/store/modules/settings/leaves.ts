import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { ILeaveListColumn } from "../../../interfaces/leaves/ILeaveList";

export interface ILeavesSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<ILeaveListColumn>;
}

const initialState: ILeavesSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const leavesSettingsSlice = createSlice({
  name: "leavesSettings",
  initialState,
  reducers: {
    saveLeavesTableState: (
      state: ILeavesSettingsState,
      action: { payload: ILeavesSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    clearLeavesTableState: (state: ILeavesSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
    },
  },
});

export const { saveLeavesTableState, clearLeavesTableState } =
  leavesSettingsSlice.actions;

export const leavesSettings = leavesSettingsSlice.reducer;
