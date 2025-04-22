import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";

export interface IShiftReportsSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IShiftReportsListColumn>;
}

const initialState: IShiftReportsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const shiftReportsSettingsSlice = createSlice({
  name: "shiftReportsSettings",
  initialState,
  reducers: {
    saveShiftReportsTableState: (
      state: IShiftReportsSettingsState,
      action: { payload: IShiftReportsSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    clearShiftReportsTableState: (state: IShiftReportsSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
    },
  },
});

export const { saveShiftReportsTableState, clearShiftReportsTableState } =
  shiftReportsSettingsSlice.actions;

export const shiftReportsSettings = shiftReportsSettingsSlice.reducer;
