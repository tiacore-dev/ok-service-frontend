import { apiClient } from "./base";
import type { IRole } from "../interfaces/roles/IRole";

export const fetchRoles = async (): Promise<IRole[]> => {
  const { data } = await apiClient.get<{ roles: IRole[] }>("/roles/all");

  return data.roles;
};
