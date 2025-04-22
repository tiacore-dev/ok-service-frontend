import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IObjectsListColumn } from "../../../interfaces/objects/IObjectsList";

export interface IObjectsSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IObjectsListColumn>;
}

const initialState: IObjectsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const objectsSettingsSlice = createSlice({
  name: "objectsSettings",
  initialState,
  reducers: {
    saveObjectsTableState: (
      state: IObjectsSettingsState,
      action: { payload: IObjectsSettingsState },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    clearObjectsTableState: (state: IObjectsSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
    },
  },
});

export const { saveObjectsTableState, clearObjectsTableState } =
  objectsSettingsSlice.actions;

export const objectsSettings = objectsSettingsSlice.reducer;
