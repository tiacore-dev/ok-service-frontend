import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import {
  defaultShiftReportsFiltersState,
  type IShiftReportsFiltersState,
} from "../../../interfaces/shiftReports/IShiftReportsFiltersState";

export interface IShiftReportsSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IShiftReportsListColumn>;
  shiftReportsFilters: IShiftReportsFiltersState;
}

const initialState: IShiftReportsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {
    field: "date",
    order: "descend",
  },
  shiftReportsFilters: { ...defaultShiftReportsFiltersState },
};

const shiftReportsSettingsSlice = createSlice({
  name: "shiftReportsSettings",
  initialState,
  reducers: {
    saveShiftReportsTableState: (
      state: IShiftReportsSettingsState,
      action: { payload: IShiftReportsSettingsState }
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
      state.shiftReportsFilters = action.payload.shiftReportsFilters;
    },
    saveShiftReportsFiltersState: (
      state: IShiftReportsSettingsState,
      action: { payload: IShiftReportsFiltersState }
    ) => {
      state.shiftReportsFilters = action.payload;
    },
    clearShiftReportsTableState: (state: IShiftReportsSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.shiftReportsFilters = { ...defaultShiftReportsFiltersState };
    },
  },
});

export const {
  saveShiftReportsTableState,
  saveShiftReportsFiltersState,
  clearShiftReportsTableState,
} = shiftReportsSettingsSlice.actions;

export const shiftReportsSettings = shiftReportsSettingsSlice.reducer;
