import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "../../../interfaces/users/IUser";
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
  city: undefined,
  position: undefined,
  is_active: true,
  deleted: false,
};

const setUserData = (state: IEditableUserState, userData: Partial<IUser>) => {
  state.name = userData.name;
  state.role = userData.role;
  state.login = userData.login;
  state.category = userData.category;
  state.city = userData.city;
  state.position = userData.position;
  state.is_active = userData.is_active ?? true;
  state.deleted = userData.deleted ?? false;
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

    setCity: (state: IEditableUserState, action: { payload: string }) => {
      state.city = action.payload;
    },

    setPosition: (
      state: IEditableUserState,
      action: PayloadAction<string | undefined>,
    ) => {
      state.position = action.payload;
    },

    setIsActive: (state: IEditableUserState, action: { payload: boolean }) => {
      state.is_active = action.payload;
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
