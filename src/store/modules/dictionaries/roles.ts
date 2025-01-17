import { createSlice } from "@reduxjs/toolkit";
import { IRole } from "../../../interfaces/roles/IRole";

interface IRolesState {
  data: IRole[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IRolesState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    getRolesRequest: (state: IRolesState) => {
      state.loading = true;
      state.loaded = false;
    },
    getRolesFailure: (state: IRolesState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getRolesSuccess: (state: IRolesState, action: { payload: IRole[] }) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearRolesState: (state: IRolesState) => {
      (state.data = []), (state.loading = true);
      state.loaded = false;
      state.errMsg = "";
    },
  },
});

export const {
  getRolesRequest,
  getRolesFailure,
  getRolesSuccess,
  clearRolesState,
} = rolesSlice.actions;

export const roles = rolesSlice.reducer;
