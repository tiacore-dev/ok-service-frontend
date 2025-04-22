import { createSlice } from "@reduxjs/toolkit";
import { IWorkPricesList } from "../../../interfaces/workPrices/IWorkPricesList";

interface IWorkPricesState {
  data: IWorkPricesList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IWorkPricesState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const workPricesSlice = createSlice({
  name: "work-prices",
  initialState,
  reducers: {
    getWorkPricesRequest: (state: IWorkPricesState) => {
      state.loading = true;
      state.loaded = false;
    },
    getWorkPricesFailure: (
      state: IWorkPricesState,
      action: { payload: string },
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getWorkPricesSuccess: (
      state: IWorkPricesState,
      action: { payload: IWorkPricesList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearWorkPricesState: (state: IWorkPricesState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getWorkPricesRequest,
  getWorkPricesFailure,
  getWorkPricesSuccess,
  clearWorkPricesState,
} = workPricesSlice.actions;

export const workPrices = workPricesSlice.reducer;
