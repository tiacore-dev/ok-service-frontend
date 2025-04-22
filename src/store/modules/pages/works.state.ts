import { createSlice } from "@reduxjs/toolkit";
import { IWorksList } from "../../../interfaces/works/IWorksList";

interface IWorksState {
  data: IWorksList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IWorksState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const worksSlice = createSlice({
  name: "works",
  initialState,
  reducers: {
    getWorksRequest: (state: IWorksState) => {
      state.loading = true;
      state.loaded = false;
    },
    getWorksFailure: (state: IWorksState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getWorksSuccess: (
      state: IWorksState,
      action: { payload: IWorksList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearWorksState: (state: IWorksState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getWorksRequest,
  getWorksFailure,
  getWorksSuccess,
  clearWorksState,
} = worksSlice.actions;

export const works = worksSlice.reducer;
