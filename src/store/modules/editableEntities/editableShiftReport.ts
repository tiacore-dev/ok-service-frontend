import { createSlice } from "@reduxjs/toolkit";
import { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";

export interface IEditableShiftReportState
  extends Omit<IShiftReport, "shift_report_id" | "number"> {
  sent: boolean;
}

const initialState: IEditableShiftReportState = {
  sent: false,
  user: "",
  // date_start: null,
  // date_end: null,
  project: "",
  signed: false,
  night_shift: false,
  extreme_conditions: false,
  lng_start: undefined,
  ltd_start: undefined,
  lng_end: undefined,
  ltd_end: undefined,
  distance_start: undefined,
  distance_end: undefined,
};

const setShiftReportData = (
  state: IEditableShiftReportState,
  shiftReportData: IEditableShiftReportState | IShiftReport
) => {
  state.user = shiftReportData.user;
  state.date_end = shiftReportData.date_end;
  state.date_start = shiftReportData.date_start;
  state.project = shiftReportData.project;
  state.signed = shiftReportData.signed;
  state.night_shift = shiftReportData.night_shift;
  state.extreme_conditions = shiftReportData.extreme_conditions;
  state.lng_start = shiftReportData.lng_start;
  state.ltd_start = shiftReportData.ltd_start;
  state.lng_end = shiftReportData.lng_end;
  state.ltd_end = shiftReportData.ltd_end;
  state.distance_start = shiftReportData.distance_start;
  state.distance_end = shiftReportData.distance_end;
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
    setDateTo: (
      state: IEditableShiftReportState,
      action: { payload: number }
    ) => {
      state.date_end = action.payload;
    },
    setDateFrom: (
      state: IEditableShiftReportState,
      action: { payload: number }
    ) => {
      state.date_start = action.payload;
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

    toggleNightShift: (state: IEditableShiftReportState) => {
      state.night_shift = !state.night_shift;
    },
    toggleExtremeConditions: (state: IEditableShiftReportState) => {
      state.extreme_conditions = !state.extreme_conditions;
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
