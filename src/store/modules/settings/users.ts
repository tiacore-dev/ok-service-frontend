import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IUsersListColumn } from "../../../interfaces/users/IUsersList";
import {
  defaultUsersFiltersState,
  type IUsersFiltersState,
} from "../../../interfaces/users/IUsersFiltersState";

export interface IUsersSettingsState {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<IUsersListColumn>;
  usersFilters: IUsersFiltersState;
}

const initialState: IUsersSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
  usersFilters: { ...defaultUsersFiltersState },
};

const usersSettingsSlice = createSlice({
  name: "usersSettings",
  initialState,
  reducers: {
    saveUsersTableState: (
      state: IUsersSettingsState,
      action: {
        payload: Pick<IUsersSettingsState, "pagination" | "filters" | "sorter">;
      },
    ) => {
      state.pagination = action.payload.pagination;
      state.filters = action.payload.filters;
      state.sorter = action.payload.sorter;
    },
    saveUsersFiltersState: (
      state: IUsersSettingsState,
      action: { payload: IUsersFiltersState },
    ) => {
      state.usersFilters = action.payload;
    },
    clearUsersTableState: (state: IUsersSettingsState) => {
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sorter = initialState.sorter;
      state.usersFilters = { ...defaultUsersFiltersState };
    },
  },
});

export const {
  saveUsersTableState,
  saveUsersFiltersState,
  clearUsersTableState,
} = usersSettingsSlice.actions;

export const usersSettings = usersSettingsSlice.reducer;
