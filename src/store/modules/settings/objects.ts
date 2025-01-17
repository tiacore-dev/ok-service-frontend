import { createSlice } from "@reduxjs/toolkit";

interface IObjectsFilter {
  name: string;
}

export interface IObjectsSettingsState {
  filters: IObjectsFilter;
  sort?: Record<string, 1 | -1>;
}

const initialState: IObjectsSettingsState = {
  filters: {
    name: "",
  },
  sort: { name: 1 },
};

const objectsSettingsSlice = createSlice({
  name: "objectsSettings",
  initialState,
  reducers: {
    setObjectsFiltersName: (
      state: IObjectsSettingsState,
      action: { payload: string }
    ) => {
      state.filters.name = action.payload;
    },
    clearObjectsSettingsState: (state: IObjectsSettingsState) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setObjectsFiltersName, clearObjectsSettingsState } =
  objectsSettingsSlice.actions;

export const objectsSettings = objectsSettingsSlice.reducer;
