import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { ILeaveListColumn } from "../../../interfaces/leaves/ILeaveList";
import {
  defaultLeavesFiltersState,
  type ILeavesFiltersState,
} from "../../../interfaces/leaves/ILeavesFiltersState";

export interface ILeavesSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<ILeaveListColumn>;
  leavesFilters: ILeavesFiltersState;
}

const initialState: ILeavesSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
  leavesFilters: { ...defaultLeavesFiltersState },
};

const leavesSettingsSlice = createSlice({
  name: "leavesSettings",
  initialState,
  reducers: {
    saveLeavesTableState: (
      state: ILeavesSettingsState,
      action: {
        payload: Pick<
          ILeavesSettingsState,
          "pagination" | "filters" | "sorter"
        >;
      },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    saveLeavesFiltersState: (
      state: ILeavesSettingsState,
      action: { payload: ILeavesFiltersState },
    ) => {
      state.leavesFilters = action.payload;
    },
    clearLeavesTableState: (state: ILeavesSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.leavesFilters = { ...defaultLeavesFiltersState };
    },
  },
});

export const {
  saveLeavesTableState,
  saveLeavesFiltersState,
  clearLeavesTableState,
} = leavesSettingsSlice.actions;

export const leavesSettings = leavesSettingsSlice.reducer;
