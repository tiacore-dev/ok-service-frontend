import { createSlice } from "@reduxjs/toolkit";
import {
  defaultProjectWorksFiltersState,
  type IProjectWorksFiltersState,
} from "../../../interfaces/projectWorks/IProjectWorksFiltersState";

export interface IProjectWorksSettingsState {
  filtersByProject: Record<string, IProjectWorksFiltersState>;
}

const initialState: IProjectWorksSettingsState = {
  filtersByProject: {},
};

const projectWorksSettingsSlice = createSlice({
  name: "projectWorksSettings",
  initialState,
  reducers: {
    saveProjectWorksFiltersState: (
      state: IProjectWorksSettingsState,
      action: {
        payload: { projectId: string; filters: IProjectWorksFiltersState };
      },
    ) => {
      state.filtersByProject[action.payload.projectId] = action.payload.filters;
    },
    clearProjectWorksFiltersState: (state: IProjectWorksSettingsState) => {
      state.filtersByProject = {};
    },
    clearProjectWorksFiltersByProject: (
      state: IProjectWorksSettingsState,
      action: { payload: string },
    ) => {
      if (action.payload in state.filtersByProject) {
        delete state.filtersByProject[action.payload];
      }
    },
    resetProjectWorksFiltersState: (
      state: IProjectWorksSettingsState,
      action: { payload: string },
    ) => {
      state.filtersByProject[action.payload] = {
        ...defaultProjectWorksFiltersState,
      };
    },
  },
});

export const {
  saveProjectWorksFiltersState,
  clearProjectWorksFiltersState,
  clearProjectWorksFiltersByProject,
  resetProjectWorksFiltersState,
} = projectWorksSettingsSlice.actions;

export const projectWorksSettings = projectWorksSettingsSlice.reducer;
