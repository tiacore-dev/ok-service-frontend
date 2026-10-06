import { apiClient } from "./base";
import type { ISystemSetting } from "../interfaces/systemSettings/ISystemSetting";

export interface EditSystemSettingPayload {
  value: string;
}

export const fetchSystemSettings = async (): Promise<ISystemSetting[]> => {
  const { data } = await apiClient.get<{
    system_settings: ISystemSetting[];
  }>("/system_settings/all");
  return data.system_settings;
};

export const fetchSystemSetting = async (
  systemSettingId: string,
): Promise<ISystemSetting> => {
  const { data } = await apiClient.get<{ system_setting: ISystemSetting }>(
    `/system_settings/${systemSettingId}/view`,
  );
  return data.system_setting;
};

export const updateSystemSetting = async (
  systemSettingId: string,
  payload: EditSystemSettingPayload,
): Promise<ISystemSetting> => {
  const { data } = await apiClient.patch<{
    system_setting: ISystemSetting;
  }>(`/system_settings/${systemSettingId}/edit`, payload);
  return data.system_setting;
};
