import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";

export interface IWorksSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IWorksListColumn>;
}

const initialState: IWorksSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const worksSettingsSlice = createSlice({
  name: "worksSettings",
  initialState,
  reducers: {
    saveWorksTableState: (
      state: IWorksSettingsState,
      action: { payload: IWorksSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    clearWorksTableState: (state: IWorksSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
    },
  },
});

export const { saveWorksTableState, clearWorksTableState } =
  worksSettingsSlice.actions;

export const worksSettings = worksSettingsSlice.reducer;
