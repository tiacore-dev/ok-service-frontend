import { createSlice } from "@reduxjs/toolkit";

interface IShiftReportsFilter {
  name?: string;
}

export interface IShiftReportsSettingsState {
  filters: IShiftReportsFilter;
  sort?: Record<string, 1 | -1>;
}

const initialState: IShiftReportsSettingsState = {
  filters: {},
  sort: { date: 1 },
};

const shiftReportsSettingsSlice = createSlice({
  name: "shiftReportsSettings",
  initialState,
  reducers: {
    setShiftReportsFiltersName: (
      state: IShiftReportsSettingsState,
      action: { payload: string }
    ) => {
      state.filters.name = action.payload;
    },
    clearShiftReportsSettingsState: (state: IShiftReportsSettingsState) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setShiftReportsFiltersName, clearShiftReportsSettingsState } =
  shiftReportsSettingsSlice.actions;

export const shiftReportsSettings = shiftReportsSettingsSlice.reducer;
