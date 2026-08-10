import { apiClient } from "./base";
import type { IMeasurementUnit } from "../interfaces/measurementUnits/IMeasurementUnit";

export interface EditableMeasurementUnitPayload {
  name: string;
}

export interface IMeasurementUnitMessage {
  msg: string;
  measurement_unit_id?: string;
}

export const fetchMeasurementUnits = async (): Promise<IMeasurementUnit[]> => {
  const { data } = await apiClient.get<{
    measurement_units: IMeasurementUnit[];
  }>("/measurement_units/all");
  return data.measurement_units;
};

export const createMeasurementUnit = async (
  payload: EditableMeasurementUnitPayload,
): Promise<IMeasurementUnitMessage> => {
  const { data } = await apiClient.post<IMeasurementUnitMessage>(
    "/measurement_units/add",
    payload,
  );
  return data;
};

export const updateMeasurementUnit = async (
  measurementUnitId: string,
  payload: EditableMeasurementUnitPayload,
): Promise<IMeasurementUnitMessage> => {
  const { data } = await apiClient.patch<IMeasurementUnitMessage>(
    `/measurement_units/${measurementUnitId}/edit`,
    payload,
  );
  return data;
};

export const deleteMeasurementUnit = async (
  measurementUnitId: string,
): Promise<IMeasurementUnitMessage> => {
  const { data } = await apiClient.delete<IMeasurementUnitMessage>(
    `/measurement_units/${measurementUnitId}/delete/hard`,
  );
  return data;
};
