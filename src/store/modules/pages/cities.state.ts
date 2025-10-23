import { createSlice } from "@reduxjs/toolkit";
import { ICitiesList } from "../../../interfaces/cities/ICitiesList";

interface ICitiesState {
  data: ICitiesList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: ICitiesState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    getCitiesRequest: (state: ICitiesState) => {
      state.loading = true;
      state.loaded = false;
    },
    getCitiesFailure: (state: ICitiesState, action: { payload: string }) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getCitiesSuccess: (
      state: ICitiesState,
      action: { payload: ICitiesList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearCitiesState: (state: ICitiesState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getCitiesRequest,
  getCitiesFailure,
  getCitiesSuccess,
  clearCitiesState,
} = citiesSlice.actions;

export const cities = citiesSlice.reducer;
