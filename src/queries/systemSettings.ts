import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  fetchSystemSetting,
  fetchSystemSettings,
  updateSystemSetting,
  type EditSystemSettingPayload,
} from "../api/system-settings.api";
import type { ISystemSetting } from "../interfaces/systemSettings/ISystemSetting";
import { createQueryKeys } from "../queryKeys";

export const systemSettingsKeys = createQueryKeys("systemSettings");

type SystemSettingsQueryOptions<TData> = Omit<
  UseQueryOptions<ISystemSetting[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useSystemSettingsQuery = <TData = ISystemSetting[]>(
  options?: SystemSettingsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: systemSettingsKeys.list(),
    queryFn: fetchSystemSettings,
    ...options,
  });

type SystemSettingQueryOptions<TData> = Omit<
  UseQueryOptions<ISystemSetting, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useSystemSettingQuery = <TData = ISystemSetting>(
  systemSettingId: string,
  options?: SystemSettingQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: systemSettingsKeys.detail(systemSettingId),
    queryFn: () => fetchSystemSetting(systemSettingId),
    enabled: Boolean(systemSettingId),
    ...options,
  });

interface UpdateSystemSettingVariables {
  systemSettingId: string;
  payload: EditSystemSettingPayload;
}

export const useUpdateSystemSettingMutation = (): UseMutationResult<
  ISystemSetting,
  Error,
  UpdateSystemSettingVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ systemSettingId, payload }) =>
      updateSystemSetting(systemSettingId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.list() });
      queryClient.invalidateQueries({
        queryKey: systemSettingsKeys.detail(variables.systemSettingId),
      });
    },
  });
};
