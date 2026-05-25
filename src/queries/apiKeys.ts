import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  addApiKeyPermissionsMany,
  deleteApiKey,
  deleteApiKeyPermissionRelation,
  fetchApiKeyPermissionRelations,
  fetchApiKeyPermissionTypes,
  fetchApiKeys,
  generateApiKey,
  type AddApiKeyPermissionsManyPayload,
  type GenerateApiKeyPayload,
  type GenerateApiKeyResponse,
} from "../api/api-keys.api";
import type { IApiKey } from "../interfaces/apiKeys/IApiKey";
import type { IApiKeyPermissionType } from "../interfaces/apiKeys/IApiKeyPermissionType";
import type { IApiKeyPermissionRelation } from "../interfaces/apiKeys/IApiKeyPermissionRelation";
import { createQueryKeys } from "../queryKeys";

export const apiKeysKeys = createQueryKeys("apiKeys");
export const apiKeyPermissionTypesKeys = createQueryKeys("apiKeyPermissionTypes");
export const apiKeyPermissionRelationsKeys = createQueryKeys(
  "apiKeyPermissionRelations",
);

export const useApiKeysQuery = (): UseQueryResult<IApiKey[], Error> =>
  useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: fetchApiKeys,
  });

export const useApiKeyPermissionTypesQuery = (): UseQueryResult<
  IApiKeyPermissionType[],
  Error
> =>
  useQuery({
    queryKey: apiKeyPermissionTypesKeys.list(),
    queryFn: fetchApiKeyPermissionTypes,
  });

export const useApiKeyPermissionRelationsQuery = (): UseQueryResult<
  IApiKeyPermissionRelation[],
  Error
> =>
  useQuery({
    queryKey: apiKeyPermissionRelationsKeys.list(),
    queryFn: fetchApiKeyPermissionRelations,
  });

export const useGenerateApiKeyMutation = (): UseMutationResult<
  GenerateApiKeyResponse,
  Error,
  GenerateApiKeyPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() });
    },
  });
};

export const useDeleteApiKeyMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() });
      queryClient.invalidateQueries({
        queryKey: apiKeyPermissionRelationsKeys.list(),
      });
    },
  });
};

export const useAddApiKeyPermissionsManyMutation = (): UseMutationResult<
  void,
  Error,
  AddApiKeyPermissionsManyPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addApiKeyPermissionsMany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiKeyPermissionRelationsKeys.list(),
      });
    },
  });
};

export const useDeleteApiKeyPermissionRelationMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApiKeyPermissionRelation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiKeyPermissionRelationsKeys.list(),
      });
    },
  });
};
