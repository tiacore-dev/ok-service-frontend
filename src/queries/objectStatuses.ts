import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchObjectStatuses } from "../api/object-statuses.api";
import type { IObjectStatus } from "../interfaces/objectStatuses/IObjectStatus";
import { createQueryKeys } from "../queryKeys";

export const objectStatusesKeys = createQueryKeys("objectStatuses");

export const useObjectStatusesQuery = (): UseQueryResult<
  IObjectStatus[],
  Error
> =>
  useQuery({
    queryKey: objectStatusesKeys.list(),
    queryFn: fetchObjectStatuses,
  });

export const useObjectStatuses = () => {
  const query = useObjectStatusesQuery();
  const statuses = query.data ?? [];

  const statusMap = useMemo(() => {
    return statuses.reduce<Record<string, IObjectStatus>>((acc, status) => {
      acc[status.object_status_id] = status;
      return acc;
    }, {});
  }, [statuses]);

  const statusOptions = useMemo(
    () =>
      statuses.map((status) => ({
        text: status.name,
        label: status.name,
        value: status.object_status_id,
      })),
    [statuses],
  );

  return { ...query, statuses, statusMap, statusOptions };
};
