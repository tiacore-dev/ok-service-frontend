import { createSlice } from "@reduxjs/toolkit";

interface IUsersFilter {
  name: string;
}

export interface IUsersSettingsState {
  filters: IUsersFilter;
  sort?: Record<string, 1 | -1>;
}

const initialState: IUsersSettingsState = {
  filters: {
    name: "",
  },
  sort: { date: 1 },
};

const usersSettingsSlice = createSlice({
  name: "usersSettings",
  initialState,
  reducers: {
    setUsersFiltersName: (
      state: IUsersSettingsState,
      action: { payload: string }
    ) => {
      state.filters.name = action.payload;
    },
    clearUsersSettingsState: (state: IUsersSettingsState) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setUsersFiltersName, clearUsersSettingsState } =
  usersSettingsSlice.actions;

export const usersSettings = usersSettingsSlice.reducer;
