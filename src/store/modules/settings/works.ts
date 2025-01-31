import { createSlice } from "@reduxjs/toolkit";

interface IWorksFilter {
  name: string;
}

export interface IWorksSettingsState {
  filters: IWorksFilter;
  sort?: Record<string, 1 | -1>;
}

const initialState: IWorksSettingsState = {
  filters: {
    name: "",
  },
  sort: { date: 1 },
};

const worksSettingsSlice = createSlice({
  name: "worksSettings",
  initialState,
  reducers: {
    setWorksFiltersName: (
      state: IWorksSettingsState,
      action: { payload: string }
    ) => {
      state.filters.name = action.payload;
    },
    clearWorksSettingsState: (state: IWorksSettingsState) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setWorksFiltersName, clearWorksSettingsState } =
  worksSettingsSlice.actions;

export const worksSettings = worksSettingsSlice.reducer;
