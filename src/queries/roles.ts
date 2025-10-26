import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchRoles } from "../api/roles.api";
import type { IRole } from "../interfaces/roles/IRole";
import { createQueryKeys } from "../queryKeys";

export const rolesKeys = createQueryKeys("roles");

export const useRolesQuery = (): UseQueryResult<IRole[], Error> =>
  useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
  });

export const useRoles = () => {
  const query = useRolesQuery();
  const roles = query.data ?? [];

  const rolesMap = useMemo(() => {
    return roles.reduce<Record<string, IRole>>((acc, role) => {
      acc[role.role_id] = role;
      return acc;
    }, {});
  }, [roles]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        text: role.name,
        label: role.name,
        value: role.role_id,
      })),
    [roles],
  );

  return { ...query, roles, rolesMap, roleOptions };
};
