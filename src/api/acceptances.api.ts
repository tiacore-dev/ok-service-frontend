import { apiClient } from "./base";
import type {
  EditableAcceptancePayload,
  IAcceptance,
  IAcceptanceStatusHistory,
  IWorkAcceptanceRelation,
} from "../interfaces/acceptances/IAcceptance";

export const fetchAcceptances = async (
  projectId: string,
): Promise<IAcceptance[]> => {
  const { data } = await apiClient.get<{ acceptances: IAcceptance[] }>(
    "/acceptances/all",
    { params: { project_id: projectId, limit: 1000 } },
  );
  return data.acceptances;
};

export const fetchAcceptance = async (
  acceptanceId: string,
): Promise<IAcceptance> => {
  const { data } = await apiClient.get<{ acceptance: IAcceptance }>(
    `/acceptances/${acceptanceId}/view`,
  );
  return data.acceptance;
};

export const fetchAcceptanceHistory = async (
  acceptanceId: string,
): Promise<IAcceptanceStatusHistory[]> => {
  const { data } = await apiClient.get<{
    history: IAcceptanceStatusHistory[];
  }>(`/acceptances/${acceptanceId}/history`);
  return data.history;
};

export const createAcceptance = async (
  payload: EditableAcceptancePayload,
): Promise<string> => {
  const { data } = await apiClient.post<{ id: string }>(
    "/acceptances/add",
    payload,
  );
  return data.id;
};

export const updateAcceptance = async (
  acceptanceId: string,
  payload: EditableAcceptancePayload,
): Promise<void> => {
  await apiClient.patch(`/acceptances/${acceptanceId}/edit`, payload);
};

export const deleteAcceptance = async (acceptanceId: string): Promise<void> => {
  await apiClient.delete(`/acceptances/${acceptanceId}/delete/hard`);
};

export const fetchAcceptanceRelations = async (
  acceptanceId: string,
): Promise<IWorkAcceptanceRelation[]> => {
  const { data } = await apiClient.get<{
    work_acceptance_relations: IWorkAcceptanceRelation[];
  }>("/work-acceptance-relations/all", {
    params: { acceptance_id: acceptanceId, limit: 1000 },
  });
  return data.work_acceptance_relations;
};

export const createAcceptanceRelation = async (
  payload: Omit<IWorkAcceptanceRelation, "id">,
): Promise<void> => {
  await apiClient.post("/work-acceptance-relations/add", {
    ...payload,
    quantity: String(payload.quantity),
  });
};

export const updateAcceptanceRelation = async (
  relationId: string,
  payload: Omit<IWorkAcceptanceRelation, "id">,
): Promise<void> => {
  await apiClient.patch(`/work-acceptance-relations/${relationId}/edit`, {
    ...payload,
    quantity: String(payload.quantity),
  });
};

export const deleteAcceptanceRelation = async (
  relationId: string,
): Promise<void> => {
  await apiClient.delete(
    `/work-acceptance-relations/${relationId}/delete/hard`,
  );
};
