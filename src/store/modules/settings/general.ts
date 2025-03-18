import { createSlice } from "@reduxjs/toolkit";

export interface IGeneralSettingsState {
  showBackButton: boolean;
  appHeaderTitle?: string;
  fullScreenMode?: boolean;
}

const initialState: IGeneralSettingsState = {
  showBackButton: false,
  appHeaderTitle: undefined,
  fullScreenMode: false,
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
    toggleFullScreenMode: (state: IGeneralSettingsState) => {
      state.fullScreenMode = !state.fullScreenMode;
    },
    clearGeneralSettingsState: (state: IGeneralSettingsState) => {
      state.showBackButton = initialState.showBackButton;
    },
  },
});

export const {
  setShowBackButton,
  setAppHeaderTitle,
  toggleFullScreenMode,
  clearGeneralSettingsState,
} = generalSettingsSlice.actions;

export const generalSettings = generalSettingsSlice.reducer;
