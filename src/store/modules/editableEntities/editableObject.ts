import { createSlice } from "@reduxjs/toolkit";
import type { IObject } from "../../../interfaces/objects/IObject";
import { ObjectStatusId } from "../../../interfaces/objectStatuses/IObjectStatus";

export interface IEditableObjectState extends IObject {
  sent: boolean;
}

const initialState: IEditableObjectState = {
  sent: false,
  object_id: undefined,
  name: "",
  address: "",
  description: "",
  manager: "",
  status: ObjectStatusId.WAITING,
  city: undefined,
  lng: 0,
  ltd: 0,
  contract_start_date: undefined,
  contract_end_date: undefined,
  order_number: undefined,
  monthly_ks_closing_date: undefined,
  created_at: "",
  created_by: "",
  deleted: false,
};

const setObjectData = (
  state: IEditableObjectState,
  objectData: Partial<IObject>,
) => {
  state.object_id = objectData.object_id;
  state.name = objectData.name;
  state.address = objectData.address;
  state.description = objectData.description;
  state.status = objectData.status;
  state.manager = objectData.manager;
  state.city = objectData.city;
  state.lng = objectData.lng ?? initialState.lng;
  state.ltd = objectData.ltd ?? initialState.ltd;
  state.contract_start_date = objectData.contract_start_date;
  state.contract_end_date = objectData.contract_end_date;
  state.order_number = objectData.order_number;
  state.monthly_ks_closing_date = objectData.monthly_ks_closing_date;
  state.created_at = objectData.created_at ?? initialState.created_at;
  state.created_by = objectData.created_by ?? initialState.created_by;
  state.deleted = objectData.deleted ?? initialState.deleted;
  state.sent = false;
};

const editableObjectSlice = createSlice({
  name: "object",
  initialState,
  reducers: {
    setObjectData: (
      state: IEditableObjectState,
      action: { payload: IObject },
    ) => {
      setObjectData(state, action.payload);
    },

    setName: (state: IEditableObjectState, action: { payload: string }) => {
      state.name = action.payload;
    },

    setAddress: (state: IEditableObjectState, action: { payload: string }) => {
      state.address = action.payload;
    },

    setDescription: (
      state: IEditableObjectState,
      action: { payload: string },
    ) => {
      state.description = action.payload;
    },

    setStatus: (
      state: IEditableObjectState,
      action: { payload: ObjectStatusId },
    ) => {
      state.status = action.payload;
    },

    setManager: (state: IEditableObjectState, action: { payload: string }) => {
      state.manager = action.payload;
    },

    setCity: (
      state: IEditableObjectState,
      action: { payload: string | undefined },
    ) => {
      state.city = action.payload;
    },

    setLng: (state: IEditableObjectState, action: { payload: number }) => {
      state.lng = action.payload;
    },

    setLtd: (state: IEditableObjectState, action: { payload: number }) => {
      state.ltd = action.payload;
    },

    setContractStartDate: (
      state: IEditableObjectState,
      action: { payload: string | undefined },
    ) => {
      state.contract_start_date = action.payload;
    },

    setContractEndDate: (
      state: IEditableObjectState,
      action: { payload: string | undefined },
    ) => {
      state.contract_end_date = action.payload;
    },

    setOrderNumber: (
      state: IEditableObjectState,
      action: { payload: string | undefined },
    ) => {
      state.order_number = action.payload;
    },

    setMonthlyKsClosingDate: (
      state: IEditableObjectState,
      action: { payload: number | undefined },
    ) => {
      state.monthly_ks_closing_date = action.payload;
    },

    sendObject: (state: IEditableObjectState) => {
      state.sent = true;
    },

    saveError: (state: IEditableObjectState) => {
      state.sent = false;
    },

    clearCreateObjectState: (state: IEditableObjectState) => {
      setObjectData(state, initialState);
    },
  },
});

export const { clearCreateObjectState, ...editObjectAction } =
  editableObjectSlice.actions;

export const editableObject = editableObjectSlice.reducer;
