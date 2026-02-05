import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IMaterialsListColumn } from "../../../interfaces/materials/IMaterialsList";
import {
  defaultMaterialsFiltersState,
  type MaterialsFiltersState,
} from "../../../interfaces/materials/IMaterialsFiltersState";

export interface IMaterialsSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IMaterialsListColumn>;
  materialsFilters: MaterialsFiltersState;
}

const initialState: IMaterialsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
  materialsFilters: { ...defaultMaterialsFiltersState },
};

const materialsSettingsSlice = createSlice({
  name: "materialsSettings",
  initialState,
  reducers: {
    saveMaterialsTableState: (
      state: IMaterialsSettingsState,
      action: { payload: IMaterialsSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    saveMaterialsFiltersState: (
      state: IMaterialsSettingsState,
      action: { payload: MaterialsFiltersState },
    ) => {
      state.materialsFilters = action.payload;
    },
    clearMaterialsTableState: (state: IMaterialsSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.materialsFilters = { ...defaultMaterialsFiltersState };
    },
  },
});

export const {
  saveMaterialsTableState,
  saveMaterialsFiltersState,
  clearMaterialsTableState,
} = materialsSettingsSlice.actions;

export const materialsSettings = materialsSettingsSlice.reducer;
