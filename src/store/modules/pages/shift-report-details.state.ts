import { createSlice } from "@reduxjs/toolkit";
import { IShiftReportDetailsList } from "../../../interfaces/shiftReportDetails/IShiftReportDetailsList";

interface IShiftReportDetailsState {
  data: IShiftReportDetailsList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IShiftReportDetailsState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const shiftReportDetailsSlice = createSlice({
  name: "shift-report-detail",
  initialState,
  reducers: {
    getShiftReportDetailsRequest: (state: IShiftReportDetailsState) => {
      state.loading = true;
      state.loaded = false;
    },
    getShiftReportDetailsFailure: (
      state: IShiftReportDetailsState,
      action: { payload: string }
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getShiftReportDetailsSuccess: (
      state: IShiftReportDetailsState,
      action: { payload: IShiftReportDetailsList[] }
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearShiftReportDetailsState: (state: IShiftReportDetailsState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getShiftReportDetailsRequest,
  getShiftReportDetailsFailure,
  getShiftReportDetailsSuccess,
  clearShiftReportDetailsState,
} = shiftReportDetailsSlice.actions;

export const shiftReportDetails = shiftReportDetailsSlice.reducer;
