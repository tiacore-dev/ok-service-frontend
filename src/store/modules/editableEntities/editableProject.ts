import { createSlice } from "@reduxjs/toolkit";
import { IProject } from "../../../interfaces/projects/IProject";

export interface IEditableProjectState extends IProject {
  sent: boolean;
}

const initialState: IEditableProjectState = {
  sent: false,
  project_id: undefined,
  name: "",
  object: "",
  project_leader: "",
};

const setProjectData = (
  state: IEditableProjectState,
  projectData: Partial<IProject>
) => {
  state.project_id = projectData.project_id;
  state.name = projectData.name;
  state.object = projectData.object;
  state.project_leader = projectData.project_leader;
  state.sent = false;
};

const editableProjectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjectData: (
      state: IEditableProjectState,
      action: { payload: IProject }
    ) => {
      setProjectData(state, action.payload);
    },

    setName: (state: IEditableProjectState, action: { payload: string }) => {
      state.name = action.payload;
    },

    setObject: (state: IEditableProjectState, action: { payload: string }) => {
      state.object = action.payload;
    },

    setProjectLeader: (
      state: IEditableProjectState,
      action: { payload: string }
    ) => {
      state.project_leader = action.payload;
    },

    sendProject: (state: IEditableProjectState) => {
      state.sent = true;
    },

    saveError: (state: IEditableProjectState) => {
      state.sent = false;
    },

    clearCreateProjectState: (state: IEditableProjectState) => {
      setProjectData(state, initialState);
    },
  },
});

export const { clearCreateProjectState, ...editProjectAction } =
  editableProjectSlice.actions;

export const editableProject = editableProjectSlice.reducer;
