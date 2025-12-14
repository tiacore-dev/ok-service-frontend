import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import {
  defaultWorksFiltersState,
  type WorksFiltersState,
} from "../../../interfaces/works/IWorksFiltersState";

export interface IWorksSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IWorksListColumn>;
  worksFilters: WorksFiltersState;
}

const initialState: IWorksSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
  worksFilters: { ...defaultWorksFiltersState },
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
    saveWorksFiltersState: (
      state: IWorksSettingsState,
      action: { payload: WorksFiltersState },
    ) => {
      state.worksFilters = action.payload;
    },
    clearWorksTableState: (state: IWorksSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.worksFilters = { ...defaultWorksFiltersState };
    },
  },
});

export const {
  saveWorksTableState,
  saveWorksFiltersState,
  clearWorksTableState,
} = worksSettingsSlice.actions;

export const worksSettings = worksSettingsSlice.reducer;
