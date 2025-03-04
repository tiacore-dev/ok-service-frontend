import { createSlice } from "@reduxjs/toolkit";
import { IProject } from "../../../interfaces/projects/IProject";
import { IProjectStat } from "../../../interfaces/projects/IProjectStat";

interface IProjectState {
  data: IProject | undefined;
  stat: Record<string, IProjectStat>;
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IProjectState = {
  data: undefined,
  stat: {},
  loading: false,
  loaded: false,
  errMsg: "",
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    getProjectRequest: (state: IProjectState) => {
      state.loading = true;
      state.loaded = false;
    },
    getProjectFailure: (state: IProjectState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getProjectSuccess: (
      state: IProjectState,
      action: { payload: IProject },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
      state.stat = {};
    },
    getProjectStatSuccess: (
      state: IProjectState,
      action: { payload: Record<string, IProjectStat> },
    ) => {
      state.stat = action.payload;
    },
    clearProjectState: (state: IProjectState) => {
      state.data = undefined;
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getProjectRequest,
  getProjectFailure,
  getProjectSuccess,
  getProjectStatSuccess,
  clearProjectState,
} = projectSlice.actions;

export const project = projectSlice.reducer;
