import { apiClient } from "./base";
import type { IObjectStatus } from "../interfaces/objectStatuses/IObjectStatus";

export const fetchObjectStatuses = async (): Promise<IObjectStatus[]> => {
  const { data } = await apiClient.get<{ object_statuses: IObjectStatus[] }>(
    "/object_statuses/all",
  );

  return data.object_statuses;
};
