import { apiClient } from "./base";

// Временный тип: уточним контракт после получения фактического ответа API.
export const fetchProjectLeadersStats = async (): Promise<unknown> => {
  const { data } = await apiClient.get("/project-leaders/get-stat", {
    params: { offset: 0, limit: 1000 },
  });

  return data;
};
