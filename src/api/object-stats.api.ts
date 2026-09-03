import { apiClient } from "./base";
import type { IObjectStatsCollection } from "../interfaces/objects/IObjectStats";

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
