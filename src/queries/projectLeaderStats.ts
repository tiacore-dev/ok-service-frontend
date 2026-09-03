import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProjectLeadersStats } from "../api/project-leader-stats.api";

export const projectLeaderStatsKeys = {
  all: () => ["projectLeaders", "stats"] as const,
};

export const useProjectLeadersStatsQuery = (): UseQueryResult<unknown, Error> =>
  useQuery({
    queryKey: projectLeaderStatsKeys.all(),
    queryFn: fetchProjectLeadersStats,
  });
