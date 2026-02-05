import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createMaterial,
  deleteMaterial,
  fetchMaterial,
  fetchMaterials,
  hardDeleteMaterial,
  updateMaterial,
  type EditableMaterialPayload,
} from "../api/materials.api";
import type { IMaterial } from "../interfaces/materials/IMaterial";
import type { IMaterialsList } from "../interfaces/materials/IMaterialsList";
import { createQueryKeys } from "../queryKeys";

export const materialsKeys = createQueryKeys("materials");

type MaterialsQueryOptions<TData> = Omit<
  UseQueryOptions<IMaterialsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useMaterialsQuery = <TData = IMaterialsList[]>(
  options?: MaterialsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: materialsKeys.list(),
    queryFn: fetchMaterials,
    ...options,
  });

type MaterialQueryOptions<TData> = Omit<
  UseQueryOptions<IMaterial, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useMaterialQuery = <TData = IMaterial>(
  materialId: string | undefined,
  options?: MaterialQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(materialId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: materialsKeys.detail(materialId ?? "unknown"),
    queryFn: () => fetchMaterial(materialId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useMaterialsMap = (
  options?: MaterialsQueryOptions<IMaterialsList[]>,
): UseQueryResult<IMaterialsList[], Error> & {
  materials: IMaterialsList[];
  materialsMap: Record<string, IMaterial>;
} => {
  const query = useMaterialsQuery(options);
  const materials = query.data ?? [];

  const materialsMap = useMemo(() => {
    return materials.reduce<Record<string, IMaterial>>((acc, material) => {
      if (material.material_id) {
        acc[material.material_id] = material;
      }
      return acc;
    }, {});
  }, [materials]);

  return { ...query, materials, materialsMap };
};

export const useCreateMaterialMutation = (): UseMutationResult<
  IMaterial,
  Error,
  EditableMaterialPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() });
    },
  });
};

export interface UpdateMaterialVariables {
  materialId: string;
  payload: EditableMaterialPayload;
}

export const useUpdateMaterialMutation = (): UseMutationResult<
  IMaterial,
  Error,
  UpdateMaterialVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ materialId, payload }) =>
      updateMaterial(materialId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() });
      queryClient.invalidateQueries({
        queryKey: materialsKeys.detail(variables.materialId),
      });
    },
  });
};

export const useDeleteMaterialMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId) => deleteMaterial(materialId),
    onSuccess: (_, materialId) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() });
      queryClient.removeQueries({ queryKey: materialsKeys.detail(materialId) });
    },
  });
};

export const useHardDeleteMaterialMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId) => hardDeleteMaterial(materialId),
    onSuccess: (_, materialId) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() });
      queryClient.removeQueries({ queryKey: materialsKeys.detail(materialId) });
    },
  });
};

export type { EditableMaterialPayload };
