import { useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  fetchProjectLeadersStats,
  type IProjectLeaderStatsParams,
} from "../api/project-leader-stats.api";

export const projectLeaderStatsKeys = {
  all: (params?: IProjectLeaderStatsParams) =>
    params
      ? (["projectLeaders", "stats", params] as const)
      : (["projectLeaders", "stats"] as const),
};

export const useProjectLeadersStatsByMonthsQuery = (year: number) =>
  useQueries({
    queries: Array.from({ length: 12 }, (_, month) => {
      const monthDate = dayjs().year(year).month(month);
      const params = {
        date_from: monthDate.startOf("month").unix(),
        date_to: monthDate.endOf("month").unix(),
      };

      return {
        queryKey: projectLeaderStatsKeys.all(params),
        queryFn: () => fetchProjectLeadersStats(params),
      };
    }),
  });
