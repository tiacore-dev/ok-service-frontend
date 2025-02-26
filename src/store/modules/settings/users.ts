import { createSlice } from "@reduxjs/toolkit";
import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IUsersListColumn } from "../../../interfaces/users/IUsersList";


export interface IUsersSettingsState {
  pagination: TablePaginationConfig, 
    filters: Record<string, FilterValue | null>, 
    sorter: SorterResult<IUsersListColumn>
}

const initialState: IUsersSettingsState = {
  pagination: {},
  filters: {},
  sorter: {},
};

const usersSettingsSlice = createSlice({
  name: "usersSettings",
  initialState,
  reducers: {
     saveUsersTableState: (
              state: IUsersSettingsState,
              action: { payload: IUsersSettingsState }
            ) => {
              state.pagination = action.payload.pagination;
              state.filters = action.payload.filters;
              state.sorter = action.payload.sorter;
            },
            clearUsersTableState: (state: IUsersSettingsState) => {
              state.pagination = initialState.pagination;
              state.filters = initialState.filters;
              state.sorter = initialState.sorter;
            },
  },
});

export const { saveUsersTableState, clearUsersTableState } =
  usersSettingsSlice.actions;

export const usersSettings = usersSettingsSlice.reducer;
