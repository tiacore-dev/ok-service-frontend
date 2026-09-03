import { useQuery } from "@tanstack/react-query";
import { fetchObjectsStats } from "../api/object-stats.api";

export const objectStatsKeys = {
  collection: () => ["objects", "stats"] as const,
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
