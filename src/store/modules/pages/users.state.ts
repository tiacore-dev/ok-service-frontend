import { createSlice } from "@reduxjs/toolkit";
import { IUsersList } from "../../../interfaces/users/IUsersList";

interface IUsersState {
  data: IUsersList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IUsersState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getUsersRequest: (state: IUsersState) => {
      state.loading = true;
      state.loaded = false;
    },
    getUsersFailure: (state: IUsersState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getUsersSuccess: (
      state: IUsersState,
      action: { payload: IUsersList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearUsersState: (state: IUsersState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getUsersRequest,
  getUsersFailure,
  getUsersSuccess,
  clearUsersState,
} = usersSlice.actions;

export const users = usersSlice.reducer;
