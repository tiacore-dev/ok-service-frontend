import { createSlice } from "@reduxjs/toolkit";
import { IMaterial } from "../../../interfaces/materials/IMaterial";

export interface IEditableMaterialState
  extends Omit<IMaterial, "material_id" | "created_at" | "created_by"> {
  sent: boolean;
}

const initialState: IEditableMaterialState = {
  sent: false,
  name: "",
  measurement_unit: "шт.",
  deleted: false,
};

const setMaterialData = (
  state: IEditableMaterialState,
  materialData: IEditableMaterialState,
) => {
  state.name = materialData.name;
  state.measurement_unit = materialData.measurement_unit;
  state.deleted = materialData.deleted;
  state.sent = false;
};

const editableMaterialSlice = createSlice({
  name: "material",
  initialState,
  reducers: {
    setMaterialData: (
      state: IEditableMaterialState,
      action: { payload: IEditableMaterialState },
    ) => {
      setMaterialData(state, action.payload);
    },

    setName: (state: IEditableMaterialState, action: { payload: string }) => {
      state.name = action.payload;
    },

    setMeasurementUnit: (
      state: IEditableMaterialState,
      action: { payload: string },
    ) => {
      state.measurement_unit = action.payload;
    },

    toggleDelete: (state: IEditableMaterialState) => {
      state.deleted = !state.deleted;
    },

    sendMaterial: (state: IEditableMaterialState) => {
      state.sent = true;
    },

    saveError: (state: IEditableMaterialState) => {
      state.sent = false;
    },

    clearCreateMaterialState: (state: IEditableMaterialState) => {
      setMaterialData(state, initialState);
    },
  },
});

export const { clearCreateMaterialState, ...editMaterialAction } =
  editableMaterialSlice.actions;

export const editableMaterial = editableMaterialSlice.reducer;
