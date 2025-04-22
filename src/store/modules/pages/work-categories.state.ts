import { createSlice } from "@reduxjs/toolkit";
import { IWorkCategoriesList } from "../../../interfaces/workCategories/IWorkCategoriesList";

interface IWorkCategoriesState {
  data: IWorkCategoriesList[];
  loading: boolean;
  loaded: boolean;
  errMsg: string;
}

const initialState: IWorkCategoriesState = {
  data: [],
  loading: false,
  loaded: false,
  errMsg: "",
};

const workCategoriesSlice = createSlice({
  name: "work-categories",
  initialState,
  reducers: {
    getWorkCategoriesRequest: (state: IWorkCategoriesState) => {
      state.loading = true;
      state.loaded = false;
    },
    getWorkCategoriesFailure: (
      state: IWorkCategoriesState,
      action: { payload: string },
    ) => {
      state.loading = false;
      state.loaded = false;
      state.errMsg = action.payload;
    },
    getWorkCategoriesSuccess: (
      state: IWorkCategoriesState,
      action: { payload: IWorkCategoriesList[] },
    ) => {
      state.loading = false;
      state.loaded = true;
      state.data = action.payload;
    },
    clearWorkCategoriesState: (state: IWorkCategoriesState) => {
      state.data = [];
      state.loaded = false;
      state.loading = false;
      state.errMsg = "";
    },
  },
});

export const {
  getWorkCategoriesRequest,
  getWorkCategoriesFailure,
  getWorkCategoriesSuccess,
  clearWorkCategoriesState,
} = workCategoriesSlice.actions;

export const workCategories = workCategoriesSlice.reducer;
