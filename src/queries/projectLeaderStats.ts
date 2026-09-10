import { useQuery } from "@tanstack/react-query";
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

export const useProjectLeadersStatsQuery = (year: number) => {
  const yearDate = dayjs().year(year);
  const params = {
    date_from: yearDate.startOf("year").valueOf(),
    date_to: yearDate.endOf("year").valueOf(),
  };

  return useQuery({
    queryKey: projectLeaderStatsKeys.all(params),
    queryFn: () => fetchProjectLeadersStats(params),
  });
};
