import { createSelector, createSlice } from "@reduxjs/toolkit";
import { IUser } from "../../interfaces/users/IUser";
import { IState } from ".";

export interface IAuthState extends IUser {
  access_token?: string;
  refresh_token?: string;
  isAuth: boolean;
}

export interface IAuthLoginPayload extends Omit<IAuthState, "isAuth"> {}

const initialState: IAuthState = {
  isAuth: false,
  name: null,
  category: 0,
  login: null,
  user_id: null,
  access_token: null,
  refresh_token: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authlogin: (state: IAuthState, action: { payload: IAuthLoginPayload }) => {
      state.isAuth = true;
      state.name = action.payload.name;
      state.category = action.payload.category;
      state.login = action.payload.login;
      state.user_id = action.payload.user_id;
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.role = action.payload.role;
    },
    refreshToken: (
      state: IAuthState,
      action: { payload: { refresh_token: string; access_token: string } }
    ) => {
      state.refresh_token = action.payload.refresh_token;
      state.access_token = action.payload.access_token;
    },
    authlogout: (state) => {
      state.isAuth = initialState.isAuth;
      state.name = initialState.name;
      state.category = initialState.category;
      state.login = initialState.login;
      state.user_id = initialState.user_id;
      state.access_token = initialState.access_token;
      state.refresh_token = initialState.refresh_token;
      state.role = initialState.role;
    },
  },
});

export const { authlogin, authlogout, refreshToken } = authSlice.actions;

export const auth = authSlice.reducer;

export const getCurrentUserId = createSelector(
  [(state: IState) => state.auth.user_id],
  (user_id) => user_id
);

export const getCurrentRole = createSelector(
  [(state: IState) => state.auth.role],
  (role) => role
);

export const getCurrentCategory = createSelector(
  [(state: IState) => state.auth.category],
  (category) => category
);
