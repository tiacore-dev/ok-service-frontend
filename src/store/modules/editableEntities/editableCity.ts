import { createSlice } from "@reduxjs/toolkit";
import { ICity } from "../../../interfaces/cities/ICity";

export interface IEditableCityState extends Pick<ICity, "name"> {
  city_id?: string;
  sent: boolean;
}

const initialState: IEditableCityState = {
  sent: false,
  name: "",
  city_id: undefined,
};

const applyCityData = (state: IEditableCityState, cityData: Partial<ICity>) => {
  state.name = cityData.name ?? "";
  state.city_id = cityData.city_id;
  state.sent = false;
};

const editableCitySlice = createSlice({
  name: "editableCity",
  initialState,
  reducers: {
    setCityData: (state: IEditableCityState, action: { payload: ICity }) => {
      applyCityData(state, action.payload);
    },
    setName: (state: IEditableCityState, action: { payload: string }) => {
      state.name = action.payload;
    },
    sendCity: (state: IEditableCityState) => {
      state.sent = true;
    },
    saveError: (state: IEditableCityState) => {
      state.sent = false;
    },
    clearEditableCityState: (state: IEditableCityState) => {
      applyCityData(state, initialState);
    },
  },
});

export const { clearEditableCityState, ...editCityAction } =
  editableCitySlice.actions;

export const editableCity = editableCitySlice.reducer;
