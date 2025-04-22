import { createSlice } from "@reduxjs/toolkit";
import { IObjectStatus } from "../../../interfaces/objectStatuses/IObjectStatus";

interface IObjectStatusesState {
  data: IObjectStatus[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IObjectStatusesState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const objectStatusesSlice = createSlice({
  name: "objectStatuses",
  initialState,
  reducers: {
    getObjectStatusesRequest: (state: IObjectStatusesState) => {
      state.loading = true;
      state.loaded = false;
    },
    getObjectStatusesFailure: (
      state: IObjectStatusesState,
      action: { payload: string },
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getObjectStatusesSuccess: (
      state: IObjectStatusesState,
      action: { payload: IObjectStatus[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearObjectStatusesState: (state: IObjectStatusesState) => {
      (state.data = []), (state.loading = true);
      state.loaded = false;
      state.errMsg = "";
    },
  },
});

export const {
  getObjectStatusesRequest,
  getObjectStatusesFailure,
  getObjectStatusesSuccess,
  clearObjectStatusesState,
} = objectStatusesSlice.actions;

export const objectStatuses = objectStatusesSlice.reducer;
