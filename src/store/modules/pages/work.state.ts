import { createSlice } from "@reduxjs/toolkit";
import { IWork } from "../../../interfaces/works/IWork";

interface IWorkState {
  data: IWork | undefined;
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IWorkState = {
  data: undefined,
  loading: false,
  loaded: false,
  errMsg: "",
};

const workSlice = createSlice({
  name: "work",
  initialState,
  reducers: {
    getWorkRequest: (state: IWorkState) => {
      state.loading = true;
      state.loaded = false;
    },
    getWorkFailure: (state: IWorkState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getWorkSuccess: (state: IWorkState, action: { payload: IWork }) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearWorkState: (state: IWorkState) => {
      state.data = undefined;
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getWorkRequest,
  getWorkFailure,
  getWorkSuccess,
  clearWorkState,
} = workSlice.actions;

export const work = workSlice.reducer;
