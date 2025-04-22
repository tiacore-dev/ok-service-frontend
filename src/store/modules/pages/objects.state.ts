import { createSlice } from "@reduxjs/toolkit";
import { IObjectsList } from "../../../interfaces/objects/IObjectsList";

interface IObjectsState {
  data: IObjectsList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IObjectsState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const objectsSlice = createSlice({
  name: "objects",
  initialState,
  reducers: {
    getObjectsRequest: (state: IObjectsState) => {
      state.loading = true;
      state.loaded = false;
    },
    getObjectsFailure: (state: IObjectsState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getObjectsSuccess: (
      state: IObjectsState,
      action: { payload: IObjectsList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearObjectsState: (state: IObjectsState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getObjectsRequest,
  getObjectsFailure,
  getObjectsSuccess,
  clearObjectsState,
} = objectsSlice.actions;

export const objects = objectsSlice.reducer;
