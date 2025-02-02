import { createSlice } from "@reduxjs/toolkit";
import { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";

interface IShiftReportState {
  data: IShiftReport | undefined;
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IShiftReportState = {
  data: undefined,
  loading: false,
  loaded: false,
  errMsg: "",
};

const shiftReportSlice = createSlice({
  name: "shiftReport",
  initialState,
  reducers: {
    getShiftReportRequest: (state: IShiftReportState) => {
      state.loading = true;
      state.loaded = false;
    },
    getShiftReportFailure: (
      state: IShiftReportState,
      action: { payload: string }
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getShiftReportSuccess: (
      state: IShiftReportState,
      action: { payload: IShiftReport }
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearShiftReportState: (state: IShiftReportState) => {
      state.data = undefined;
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getShiftReportRequest,
  getShiftReportFailure,
  getShiftReportSuccess,
  clearShiftReportState,
} = shiftReportSlice.actions;

export const shiftReport = shiftReportSlice.reducer;
