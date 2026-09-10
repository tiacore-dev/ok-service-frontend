import { apiClient } from "./base";
import type { IObjectWorkStats } from "../interfaces/objects/IObjectStats";

export interface IProjectLeaderStatsItem {
  user_id: string;
  login: string;
  name: string;
  stats: Record<string, IObjectWorkStats>;
  projects: IProjectLeaderStatsProject[];
}

export interface IProjectLeaderStatsProject {
  project_id: string;
  name: string;
  stats: Record<string, IObjectWorkStats>;
}

export interface IProjectLeaderStatsCollection {
  total: Record<string, IObjectWorkStats>;
  project_leaders: IProjectLeaderStatsItem[];
  total_count: number;
}

export interface IProjectLeaderStatsParams {
  date_from: number;
  date_to: number;
}

export const fetchProjectLeadersStats = async ({
  date_from,
  date_to,
}: IProjectLeaderStatsParams): Promise<IProjectLeaderStatsCollection> => {
  const { data } = await apiClient.get<{
    stats: IProjectLeaderStatsCollection;
  }>("/project-leaders/get-stat", {
    params: { offset: 0, limit: 1000, date_from, date_to },
  });

  return data.stats;
};
