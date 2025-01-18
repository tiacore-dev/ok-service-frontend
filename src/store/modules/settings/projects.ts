import { createSlice } from "@reduxjs/toolkit";

interface IProjectsFilter {
  name: string;
}

export interface IProjectsSettingsState {
  filters: IProjectsFilter;
  sort?: Record<string, 1 | -1>;
}

const initialState: IProjectsSettingsState = {
  filters: {
    name: "",
  },
  sort: { name: 1 },
};

const projectsSettingsSlice = createSlice({
  name: "projectsSettings",
  initialState,
  reducers: {
    setProjectsFiltersName: (
      state: IProjectsSettingsState,
      action: { payload: string }
    ) => {
      state.filters.name = action.payload;
    },
    clearProjectsSettingsState: (state: IProjectsSettingsState) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setProjectsFiltersName, clearProjectsSettingsState } =
  projectsSettingsSlice.actions;

export const projectsSettings = projectsSettingsSlice.reducer;
