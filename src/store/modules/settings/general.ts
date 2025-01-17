import { createSlice } from "@reduxjs/toolkit";

export interface IGeneralSettingsState {
  showBackButton: boolean;
  appHeaderTitle?: string;
}

const initialState: IGeneralSettingsState = {
  showBackButton: false,
  appHeaderTitle: undefined,
};

const generalSettingsSlice = createSlice({
  name: "generalSettings",
  initialState,
  reducers: {
    setShowBackButton: (
      state: IGeneralSettingsState,
      action: { payload: boolean },
    ) => {
      state.showBackButton = action.payload;
    },
    setAppHeaderTitle: (
      state: IGeneralSettingsState,
      action: { payload: string },
    ) => {
      state.appHeaderTitle = action.payload;
    },
    clearGeneralSettingsState: (state: IGeneralSettingsState) => {
      state.showBackButton = initialState.showBackButton;
    },
  },
});

export const {
  setShowBackButton,
  setAppHeaderTitle,
  clearGeneralSettingsState,
} = generalSettingsSlice.actions;

export const generalSettings = generalSettingsSlice.reducer;
