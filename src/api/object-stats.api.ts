import { apiClient } from "./base";
import type {
  IObjectStats,
  IObjectStatsCollection,
  IObjectStatsDetails,
} from "../interfaces/objects/IObjectStats";

export const fetchObjectsStats = async ({
  offset,
  limit,
  search,
}: {
  offset: number;
  limit: number;
  search?: string;
}): Promise<IObjectStatsCollection> => {
  const { data } = await apiClient.get<{ stats: IObjectStatsCollection }>(
    "/objects/get-stat",
    {
      params: { offset, limit, ...(search ? { search } : {}) },
    },
  );
  return data.stats;
};

export const fetchObjectStats = async (
  objectId: string,
): Promise<IObjectStats> => {
  const { data } = await apiClient.get<{ stats: IObjectStats }>(
    `/objects/${objectId}/get-stat`,
  );
  return data.stats;
};

export const fetchObjectStatsDetails = async (
  objectId: string,
): Promise<IObjectStatsDetails> => {
  const { data } = await apiClient.get<{ stats: IObjectStatsDetails }>(
    `/objects/${objectId}/get-stat-details`,
  );
  return data.stats;
};
