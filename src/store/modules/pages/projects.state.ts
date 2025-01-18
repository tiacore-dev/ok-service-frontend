import { createSlice } from "@reduxjs/toolkit";
import { IProjectList } from "../../../interfaces/projects/IProjectsList";

interface IProjectsState {
  data: IProjectList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IProjectsState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    getProjectsRequest: (state: IProjectsState) => {
      state.loading = true;
      state.loaded = false;
    },
    getProjectsFailure: (
      state: IProjectsState,
      action: { payload: string }
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getProjectsSuccess: (
      state: IProjectsState,
      action: { payload: IProjectList[] }
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearProjectsState: (state: IProjectsState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getProjectsRequest,
  getProjectsFailure,
  getProjectsSuccess,
  clearProjectsState,
} = projectsSlice.actions;

export const projects = projectsSlice.reducer;
