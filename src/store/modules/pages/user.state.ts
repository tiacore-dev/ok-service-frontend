import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "../../../interfaces/users/IUser";

interface IUserState {
  data: IUser | undefined;
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IUserState = {
  data: undefined,
  loading: false,
  loaded: false,
  errMsg: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getUserRequest: (state: IUserState) => {
      state.loading = true;
      state.loaded = false;
    },
    getUserFailure: (state: IUserState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getUserSuccess: (state: IUserState, action: { payload: IUser }) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearUserState: (state: IUserState) => {
      state.data = undefined;
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getUserRequest,
  getUserFailure,
  getUserSuccess,
  clearUserState,
} = userSlice.actions;

export const user = userSlice.reducer;
