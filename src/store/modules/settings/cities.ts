import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { ICitiesListColumn } from "../../../interfaces/cities/ICitiesList";

export interface ICitiesSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<ICitiesListColumn>;
}

const initialState: ICitiesSettingsState = {
  pagination: {
    current: 1,
    pageSize: 10,
  },
  filters: {},
  sorter: {},
};

const citiesSettingsSlice = createSlice({
  name: "citiesSettings",
  initialState,
  reducers: {
    saveCitiesTableState: (
      state: ICitiesSettingsState,
      action: { payload: ICitiesSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    clearCitiesTableState: (state: ICitiesSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
    },
  },
});

export const { saveCitiesTableState, clearCitiesTableState } =
  citiesSettingsSlice.actions;

export const citiesSettings = citiesSettingsSlice.reducer;
