import { createSlice } from "@reduxjs/toolkit";
import { IObject } from "../../../interfaces/objects/IObject";

interface IObjectState {
  data: IObject | undefined;
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IObjectState = {
  data: undefined,
  loading: false,
  loaded: false,
  errMsg: "",
};

const objectSlice = createSlice({
  name: "object",
  initialState,
  reducers: {
    getObjectRequest: (state: IObjectState) => {
      state.loading = true;
      state.loaded = false;
    },
    getObjectFailure: (state: IObjectState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getObjectSuccess: (state: IObjectState, action: { payload: IObject }) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearObjectState: (state: IObjectState) => {
      state.data = undefined;
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getObjectRequest,
  getObjectFailure,
  getObjectSuccess,
  clearObjectState,
} = objectSlice.actions;

export const object = objectSlice.reducer;
