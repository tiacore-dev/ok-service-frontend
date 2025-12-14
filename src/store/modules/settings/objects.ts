import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";
import {
  defaultObjectsFiltersState,
  type IObjectsFiltersState,
} from "../../../interfaces/objects/IObjectsFiltersState";

export interface IObjectsSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IObjectsListColumn>;
  objectsFilters: IObjectsFiltersState;
}

const initialState: IObjectsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
  objectsFilters: { ...defaultObjectsFiltersState },
};

const objectsSettingsSlice = createSlice({
  name: "objectsSettings",
  initialState,
  reducers: {
    saveObjectsTableState: (
      state: IObjectsSettingsState,
      action: {
        payload: Pick<
          IObjectsSettingsState,
          "pagination" | "filters" | "sorter"
        >;
      },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    saveObjectsFiltersState: (
      state: IObjectsSettingsState,
      action: { payload: IObjectsFiltersState },
    ) => {
      state.objectsFilters = action.payload;
    },
    clearObjectsTableState: (state: IObjectsSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.objectsFilters = { ...defaultObjectsFiltersState };
    },
  },
});

export const {
  saveObjectsTableState,
  saveObjectsFiltersState,
  clearObjectsTableState,
} = objectsSettingsSlice.actions;

export const objectsSettings = objectsSettingsSlice.reducer;
