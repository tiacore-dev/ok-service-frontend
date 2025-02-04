import { createSlice } from "@reduxjs/toolkit";
import { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";

export interface IEditableShiftReportState
  extends Omit<IShiftReport, "shift_report_id" | "number"> {
  sent: boolean;
}

const initialState: IEditableShiftReportState = {
  sent: false,
  user: "",
  date: new Date().valueOf(),
  project: "",
  signed: false,
};

const setShiftReportData = (
  state: IEditableShiftReportState,
  shiftReportData: IEditableShiftReportState | IShiftReport
) => {
  state.user = shiftReportData.user;
  state.date = shiftReportData.date;
  state.project = shiftReportData.project;
  state.signed = shiftReportData.signed;
  state.sent = false;
};

const editableShiftReportSlice = createSlice({
  name: "shiftReport",
  initialState,
  reducers: {
    setShiftReportData: (
      state: IEditableShiftReportState,
      action: { payload: IShiftReport }
    ) => {
      setShiftReportData(state, action.payload);
    },

    setUser: (
      state: IEditableShiftReportState,
      action: { payload: string }
    ) => {
      state.user = action.payload;
    },

    setDate: (
      state: IEditableShiftReportState,
      action: { payload: number }
    ) => {
      state.date = action.payload;
    },

    setProject: (
      state: IEditableShiftReportState,
      action: { payload: string }
    ) => {
      state.project = action.payload;
    },

    toggleSigned: (state: IEditableShiftReportState) => {
      state.signed = !state.signed;
    },

    sendShiftReport: (state: IEditableShiftReportState) => {
      state.sent = true;
    },

    saveError: (state: IEditableShiftReportState) => {
      state.sent = false;
    },

    clearCreateShiftReportState: (state: IEditableShiftReportState) => {
      setShiftReportData(state, initialState);
    },
  },
});

export const { clearCreateShiftReportState, ...editShiftReportAction } =
  editableShiftReportSlice.actions;

export const editableShiftReport = editableShiftReportSlice.reducer;
