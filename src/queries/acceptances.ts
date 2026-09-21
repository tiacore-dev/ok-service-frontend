import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAcceptance,
  createAcceptanceRelation,
  createAcceptanceRelationsBulk,
  deleteAcceptance,
  deleteAcceptanceRelation,
  deleteAcceptanceRelationsBulk,
  fetchAcceptance,
  fetchAcceptanceHistory,
  fetchAcceptanceRelations,
  fetchAcceptances,
  updateAcceptance,
  updateAcceptanceRelation,
} from "../api/acceptances.api";
import type {
  EditableAcceptancePayload,
  IWorkAcceptanceRelation,
  IWorkAcceptanceRelationBulkCreatePayload,
} from "../interfaces/acceptances/IAcceptance";
import { objectStatsKeys } from "./objectStats";

export const acceptanceKeys = {
  list: (projectId: string) => ["acceptances", "list", projectId] as const,
  detail: (id: string) => ["acceptances", "detail", id] as const,
  relations: (id: string) => ["acceptances", "relations", id] as const,
  history: (id: string) => ["acceptances", "history", id] as const,
};

export const useAcceptancesQuery = (projectId?: string) =>
  useQuery({
    queryKey: acceptanceKeys.list(projectId ?? "all"),
    queryFn: () => fetchAcceptances(projectId),
  });
export const useAcceptanceQuery = (id?: string) =>
  useQuery({
    queryKey: acceptanceKeys.detail(id ?? "unknown"),
    queryFn: () => fetchAcceptance(id!),
    enabled: Boolean(id),
  });
export const useAcceptanceRelationsQuery = (id?: string) =>
  useQuery({
    queryKey: acceptanceKeys.relations(id ?? "unknown"),
    queryFn: () => fetchAcceptanceRelations(id!),
    enabled: Boolean(id),
  });
export const useAcceptanceHistoryQuery = (id?: string, enabled = false) =>
  useQuery({
    queryKey: acceptanceKeys.history(id ?? "unknown"),
    queryFn: () => fetchAcceptanceHistory(id!),
    enabled: Boolean(id) && enabled,
  });

export const useCreateAcceptanceMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createAcceptance,
    onSuccess: (_, payload) =>
      Promise.all([
        client.invalidateQueries({
          queryKey: acceptanceKeys.list(payload.project_id),
        }),
        client.invalidateQueries({ queryKey: acceptanceKeys.list("all") }),
      ]),
  });
};
export const useUpdateAcceptanceMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: EditableAcceptancePayload;
    }) => updateAcceptance(id, payload),
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: acceptanceKeys.detail(variables.id),
      });
      client.invalidateQueries({
        queryKey: acceptanceKeys.list(variables.payload.project_id),
      });
      client.invalidateQueries({ queryKey: acceptanceKeys.list("all") });
      client.invalidateQueries({
        queryKey: acceptanceKeys.history(variables.id),
      });
    },
  });
};
export const useDeleteAcceptanceMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      deleteAcceptance(id),
    onSuccess: (_, variables) =>
      Promise.all([
        client.invalidateQueries({
          queryKey: acceptanceKeys.list(variables.projectId),
        }),
        client.invalidateQueries({ queryKey: acceptanceKeys.list("all") }),
      ]),
  });
};
export const useCreateAcceptanceRelationMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createAcceptanceRelation,
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: acceptanceKeys.relations(variables.acceptance_id),
      });
      client.invalidateQueries({ queryKey: objectStatsKeys.collection() });
    },
  });
};
export const useUpdateAcceptanceRelationMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Omit<IWorkAcceptanceRelation, "id">;
    }) => updateAcceptanceRelation(id, payload),
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: acceptanceKeys.relations(variables.payload.acceptance_id),
      });
      client.invalidateQueries({ queryKey: objectStatsKeys.collection() });
    },
  });
};
export const useDeleteAcceptanceRelationMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; acceptanceId: string }) =>
      deleteAcceptanceRelation(id),
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: acceptanceKeys.relations(variables.acceptanceId),
      });
      client.invalidateQueries({ queryKey: objectStatsKeys.collection() });
    },
  });
};

export const useReplaceAcceptanceRelationsMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      acceptanceId,
      relationIds,
      works,
    }: {
      acceptanceId: string;
      relationIds: string[];
      works: IWorkAcceptanceRelationBulkCreatePayload["works"];
    }) => {
      if (relationIds.length) {
        await deleteAcceptanceRelationsBulk(relationIds);
      }
      if (works.length) {
        await createAcceptanceRelationsBulk({
          acceptance_id: acceptanceId,
          works,
        });
      }
    },
    onSuccess: (_, variables) => {
      client.invalidateQueries({
        queryKey: acceptanceKeys.relations(variables.acceptanceId),
      });
      client.invalidateQueries({ queryKey: objectStatsKeys.collection() });
    },
  });
};
