import { createSlice } from "@reduxjs/toolkit";
import { IWork } from "../../../interfaces/works/IWork";

export interface IEditableWorkState extends Omit<IWork, "work_id"> {
  sent: boolean;
}

const initialState: IEditableWorkState = {
  sent: false,
  name: "",
  category: "",
  measurement_unit: "",
};

const setWorkData = (state: IEditableWorkState, workData: Partial<IWork>) => {
  state.name = workData.name;
  state.category = workData.category;
  state.measurement_unit = workData.measurement_unit;
  state.sent = false;
};

const editableWorkSlice = createSlice({
  name: "work",
  initialState,
  reducers: {
    setWorkData: (state: IEditableWorkState, action: { payload: IWork }) => {
      setWorkData(state, action.payload);
    },

    setName: (state: IEditableWorkState, action: { payload: string }) => {
      state.name = action.payload;
    },

    setCategory: (state: IEditableWorkState, action: { payload: string }) => {
      state.category = action.payload;
    },

    setMeasurementUnit: (
      state: IEditableWorkState,
      action: { payload: string }
    ) => {
      state.measurement_unit = action.payload;
    },

    sendWork: (state: IEditableWorkState) => {
      state.sent = true;
    },

    saveError: (state: IEditableWorkState) => {
      state.sent = false;
    },

    clearCreateWorkState: (state: IEditableWorkState) => {
      setWorkData(state, initialState);
    },
  },
});

export const { clearCreateWorkState, ...editWorkAction } =
  editableWorkSlice.actions;

export const editableWork = editableWorkSlice.reducer;
