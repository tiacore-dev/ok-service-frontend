import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";


export interface IProjectsSettingsState {
  pagination: TablePaginationConfig, 
   filters: Record<string, FilterValue | null>, 
   sorter: SorterResult<IProjectsListColumn>
}

const initialState: IProjectsSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const projectsSettingsSlice = createSlice({
  name: "projectsSettings",
  initialState,
  reducers: {
    saveProjectsTableState: (
          state: IProjectsSettingsState,
          action: { payload: IProjectsSettingsState }
        ) => {
          state.pagination = action.payload.pagination;
          state.filters = action.payload.filters;
          state.sorter = action.payload.sorter;
        },
        clearProjectsTableState: (state: IProjectsSettingsState) => {
          state.pagination = initialState.pagination;
          state.filters = initialState.filters;
          state.sorter = initialState.sorter;
        },
  },
});

export const { saveProjectsTableState, clearProjectsTableState } =
  projectsSettingsSlice.actions;

export const projectsSettings = projectsSettingsSlice.reducer;
