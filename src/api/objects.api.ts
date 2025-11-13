import { apiClient } from "./base";
import type { IObject } from "../interfaces/objects/IObject";
import type { IObjectsList } from "../interfaces/objects/IObjectsList";

export interface EditableObjectPayload
  extends Omit<IObject, "object_id" | "created_at" | "created_by" | "deleted"> {}

export const fetchObjects = async (): Promise<IObjectsList[]> => {
  const { data } = await apiClient.get<{ objects: IObjectsList[] }>(
    "/objects/all",
  );
  return data.objects;
};

export const fetchObject = async (objectId: string): Promise<IObject> => {
  const { data } = await apiClient.get<{ object: IObject }>(
    `/objects/${objectId}/view`,
  );
  return data.object;
};

export const createObject = async (
  payload: EditableObjectPayload,
): Promise<IObject> => {
  const { data } = await apiClient.post<{ object: IObject }>(
    "/objects/add",
    payload,
  );
  return data.object;
};

export const updateObject = async (
  objectId: string,
  payload: EditableObjectPayload,
): Promise<IObject> => {
  const { data } = await apiClient.patch<{ object: IObject }>(
    `/objects/${objectId}/edit`,
    payload,
  );
  return data.object;
};

export const deleteObject = async (objectId: string): Promise<void> => {
  await apiClient.delete(`/objects/${objectId}/delete/hard`);
};
