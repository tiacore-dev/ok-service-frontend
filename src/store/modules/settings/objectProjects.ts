import { createSlice } from "@reduxjs/toolkit";
import {
  defaultObjectProjectsFiltersState,
  type IObjectProjectsFiltersState,
} from "../../../interfaces/projects/IObjectProjectsFiltersState";

export interface IObjectProjectsSettingsState {
  filtersByObject: Record<string, IObjectProjectsFiltersState>;
}

const initialState: IObjectProjectsSettingsState = {
  filtersByObject: {},
};

const objectProjectsSettingsSlice = createSlice({
  name: "objectProjectsSettings",
  initialState,
  reducers: {
    saveObjectProjectsFiltersState: (
      state: IObjectProjectsSettingsState,
      action: {
        payload: { objectId: string; filters: IObjectProjectsFiltersState };
      },
    ) => {
      state.filtersByObject[action.payload.objectId] = action.payload.filters;
    },
    clearObjectProjectsFiltersState: (state: IObjectProjectsSettingsState) => {
      state.filtersByObject = {};
    },
    resetObjectProjectsFiltersState: (
      state: IObjectProjectsSettingsState,
      action: { payload: string },
    ) => {
      state.filtersByObject[action.payload] = {
        ...defaultObjectProjectsFiltersState,
      };
    },
  },
});

export const {
  saveObjectProjectsFiltersState,
  clearObjectProjectsFiltersState,
  resetObjectProjectsFiltersState,
} = objectProjectsSettingsSlice.actions;

export const objectProjectsSettings = objectProjectsSettingsSlice.reducer;
