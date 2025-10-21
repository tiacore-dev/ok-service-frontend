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
  createObject,
  deleteObject,
  fetchObject,
  fetchObjects,
  updateObject,
  type EditableObjectPayload,
} from "../api/objects.api";
import type { IObject } from "../interfaces/objects/IObject";
import type { IObjectsList } from "../interfaces/objects/IObjectsList";
import { createQueryKeys } from "../queryKeys";

export const objectsKeys = createQueryKeys("objects");

type ObjectsQueryOptions<TData> = Omit<
  UseQueryOptions<IObjectsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useObjectsQuery = <TData = IObjectsList[]>(
  options?: ObjectsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: objectsKeys.list(),
    queryFn: fetchObjects,
    ...options,
  });

type ObjectQueryOptions<TData> = Omit<
  UseQueryOptions<IObject, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useObjectQuery = <TData = IObject>(
  objectId: string | undefined,
  options?: ObjectQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(objectId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: objectsKeys.detail(objectId ?? "unknown"),
    queryFn: () => fetchObject(objectId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useObjectsMap = (
  options?: ObjectsQueryOptions<IObjectsList[]>,
): UseQueryResult<IObjectsList[], Error> & {
  objects: IObjectsList[];
  objectsMap: Record<string, IObject>;
} => {
  const query = useObjectsQuery(options);
  const objects = query.data ?? [];

  const objectsMap = useMemo(() => {
    return objects.reduce<Record<string, IObject>>((acc, obj) => {
      if (obj.object_id) {
        acc[obj.object_id] = obj;
      }
      return acc;
    }, {});
  }, [objects]);

  return { ...query, objects, objectsMap };
};

export interface UpdateObjectVariables {
  objectId: string;
  payload: EditableObjectPayload;
}

export const useCreateObjectMutation = (): UseMutationResult<
  IObject,
  Error,
  EditableObjectPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectsKeys.list() });
    },
  });
};

export const useUpdateObjectMutation = (): UseMutationResult<
  IObject,
  Error,
  UpdateObjectVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, payload }) => updateObject(objectId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: objectsKeys.list() });
      queryClient.invalidateQueries({
        queryKey: objectsKeys.detail(variables.objectId),
      });
    },
  });
};

export const useDeleteObjectMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectId) => deleteObject(objectId),
    onSuccess: (_, objectId) => {
      queryClient.invalidateQueries({ queryKey: objectsKeys.list() });
      queryClient.removeQueries({ queryKey: objectsKeys.detail(objectId) });
    },
  });
};

export type { EditableObjectPayload };
