import { apiClient } from "./base";
import type { IApiKey } from "../interfaces/apiKeys/IApiKey";
import type { IApiKeyPermissionType } from "../interfaces/apiKeys/IApiKeyPermissionType";
import type { IApiKeyPermissionRelation } from "../interfaces/apiKeys/IApiKeyPermissionRelation";

export interface GenerateApiKeyPayload {
  name?: string;
  expires_at?: number;
}

export interface GenerateApiKeyResponse {
  msg: string;
  api_key_id: string;
  token: string;
}

export interface AddApiKeyPermissionsManyPayload {
  api_key_id: string;
  permission_type_ids: string[];
}

export const fetchApiKeys = async (): Promise<IApiKey[]> => {
  const { data } = await apiClient.get<{ api_keys?: IApiKey[] }>(
    "/api-key/all",
    {
      params: { limit: 1000 },
    },
  );
  return data.api_keys ?? [];
};

export const generateApiKey = async (
  payload: GenerateApiKeyPayload,
): Promise<GenerateApiKeyResponse> => {
  const { data } = await apiClient.post<GenerateApiKeyResponse>(
    "/api-key/generate",
    payload,
  );
  return data;
};

export const deleteApiKey = async (apiKeyId: string): Promise<void> => {
  await apiClient.delete(`/api-key/${apiKeyId}/delete`);
};

export const fetchApiKeyPermissionTypes = async (): Promise<
  IApiKeyPermissionType[]
> => {
  const { data } = await apiClient.get<{
    permission_types?: IApiKeyPermissionType[];
  }>("/api-key/permission-types/all", {
    params: { limit: 1000 },
  });
  return data.permission_types ?? [];
};

export const fetchApiKeyPermissionRelations = async (): Promise<
  IApiKeyPermissionRelation[]
> => {
  const { data } = await apiClient.get<{
    relations?: IApiKeyPermissionRelation[];
  }>("/api-key/permissions/all", {
    params: { limit: 1000 },
  });
  return data.relations ?? [];
};

export const addApiKeyPermissionsMany = async (
  payload: AddApiKeyPermissionsManyPayload,
): Promise<void> => {
  await apiClient.post("/api-key/permissions/add/many", payload);
};

export const deleteApiKeyPermissionRelation = async (
  relationId: string,
): Promise<void> => {
  await apiClient.delete(`/api-key/permissions/${relationId}/delete`);
};
