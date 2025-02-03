import { createSlice } from "@reduxjs/toolkit";
import { IProjectWorksList } from "../../../interfaces/projectWorks/IProjectWorksList";

interface IProjectWorksState {
  data: IProjectWorksList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IProjectWorksState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const projectWorksSlice = createSlice({
  name: "project-works",
  initialState,
  reducers: {
    getProjectWorksRequest: (state: IProjectWorksState) => {
      state.loading = true;
      state.loaded = false;
    },
    getProjectWorksFailure: (
      state: IProjectWorksState,
      action: { payload: string }
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getProjectWorksSuccess: (
      state: IProjectWorksState,
      action: { payload: IProjectWorksList[] }
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearProjectWorksState: (state: IProjectWorksState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getProjectWorksRequest,
  getProjectWorksFailure,
  getProjectWorksSuccess,
  clearProjectWorksState,
} = projectWorksSlice.actions;

export const projectWorks = projectWorksSlice.reducer;
