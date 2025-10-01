import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "../../../interfaces/users/IUser";
import { RoleId } from "../../../interfaces/roles/IRole";

export interface IEditableUserState extends Omit<IUser, "user_id"> {
  sent: boolean;
}

const initialState: IEditableUserState = {
  sent: false,
  name: "",
  login: "",
  category: 0,
  role: RoleId.USER,
  deleted: false,
};

const setUserData = (state: IEditableUserState, userData: Partial<IUser>) => {
  state.name = userData.name;
  state.role = userData.role;
  state.login = userData.login;
  state.sent = false;
};

const editableUserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state: IEditableUserState, action: { payload: IUser }) => {
      setUserData(state, action.payload);
    },

    setName: (state: IEditableUserState, action: { payload: string }) => {
      state.name = action.payload;
    },

    setLogin: (state: IEditableUserState, action: { payload: string }) => {
      state.login = action.payload;
    },

    setRole: (state: IEditableUserState, action: { payload: RoleId }) => {
      state.role = action.payload;
    },

    setCategory: (state: IEditableUserState, action: { payload: number }) => {
      state.category = action.payload;
    },

    sendUser: (state: IEditableUserState) => {
      state.sent = true;
    },

    saveError: (state: IEditableUserState) => {
      state.sent = false;
    },

    clearCreateUserState: (state: IEditableUserState) => {
      setUserData(state, initialState);
    },
  },
});

export const { clearCreateUserState, ...editUserAction } =
  editableUserSlice.actions;

export const editableUser = editableUserSlice.reducer;
