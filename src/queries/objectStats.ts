import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchObjectStats,
  fetchObjectStatsDetails,
  fetchObjectsStats,
} from "../api/object-stats.api";

export const objectStatsKeys = {
  collection: () => ["objects", "stats"] as const,
  item: (objectId: string) => ["objects", "stats", objectId] as const,
  details: (objectId: string) =>
    ["objects", "stats", objectId, "details"] as const,
};

export const useObjectsStatsQuery = (params: {
  offset: number;
  limit: number;
  search?: string;
}) =>
  useQuery({
    queryKey: [...objectStatsKeys.collection(), params],
    queryFn: () => fetchObjectsStats(params),
  });

export const useObjectStatsQuery = (objectId: string) =>
  useQuery({
    queryKey: objectStatsKeys.item(objectId),
    queryFn: () => fetchObjectStats(objectId),
    enabled: Boolean(objectId),
  });

export const useObjectStatsDetailsQuery = (objectId: string) =>
  useQuery({
    queryKey: objectStatsKeys.details(objectId),
    queryFn: () => fetchObjectStatsDetails(objectId),
    enabled: Boolean(objectId),
  });

export const useObjectStatsQueries = (objectIds: string[]) => ({
  statsQueries: useQueries({
    queries: objectIds.map((objectId) => ({
      queryKey: objectStatsKeys.item(objectId),
      queryFn: () => fetchObjectStats(objectId),
    })),
  }),
  detailsQueries: useQueries({
    queries: objectIds.map((objectId) => ({
      queryKey: objectStatsKeys.details(objectId),
      queryFn: () => fetchObjectStatsDetails(objectId),
    })),
  }),
});
