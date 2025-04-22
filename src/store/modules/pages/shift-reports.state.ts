import { createSlice } from "@reduxjs/toolkit";
import { IShiftReportsList } from "../../../interfaces/shiftReports/IShiftReportsList";

interface IShiftReportsState {
  data: IShiftReportsList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IShiftReportsState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const shiftReportsSlice = createSlice({
  name: "shiftReports",
  initialState,
  reducers: {
    getShiftReportsRequest: (state: IShiftReportsState) => {
      state.loading = true;
      state.loaded = false;
    },
    getShiftReportsFailure: (
      state: IShiftReportsState,
      action: { payload: string },
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getShiftReportsSuccess: (
      state: IShiftReportsState,
      action: { payload: IShiftReportsList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearShiftReportsState: (state: IShiftReportsState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getShiftReportsRequest,
  getShiftReportsFailure,
  getShiftReportsSuccess,
  clearShiftReportsState,
} = shiftReportsSlice.actions;

export const shiftReports = shiftReportsSlice.reducer;
