import { isAxiosError } from "axios";
import type { IWork } from "../interfaces/works/IWork";
import { getApiErrorMessage } from "./getApiErrorMessage";

export const UNAVAILABLE_SHIFT_WORK_REASON =
  "Недоступно для разряда сотрудника";

export const getShiftWorkAvailability = (
  work: IWork | undefined,
  performerCategory: number | undefined,
  serverBlockedWorkIds?: ReadonlySet<string>,
): { available: boolean; reason?: string } => {
  if (performerCategory == null || !Number.isFinite(performerCategory)) {
    return {
      available: false,
      reason: "Не удалось определить разряд сотрудника",
    };
  }
  if (!work)
    return { available: false, reason: "Не удалось загрузить данные работы" };
  const blocked =
    serverBlockedWorkIds?.has(work.work_id!) ||
    work.work_prices?.some(
      (price) =>
        !price.deleted &&
        price.category === performerCategory &&
        price.price < 0,
    );
  return blocked
    ? { available: false, reason: UNAVAILABLE_SHIFT_WORK_REASON }
    : { available: true };
};

export const getShiftDetailWorkError = (
  work: IWork | undefined,
  performerCategory: number | undefined,
  quantity: number,
  initial?: { work: string; quantity: number },
  serverBlockedWorkIds?: ReadonlySet<string>,
): string | undefined => {
  // The backend allows unchanged historical records, even if their price is now forbidden.
  if (
    work &&
    performerCategory != null &&
    Number.isFinite(performerCategory) &&
    initial?.work === work.work_id &&
    initial.quantity === quantity
  )
    return;
  return getShiftWorkAvailability(work, performerCategory, serverBlockedWorkIds)
    .reason;
};

export const getUnavailableShiftWorkIds = (error: unknown): string[] | null => {
  if (
    !isAxiosError(error) ||
    error.response?.status !== 409 ||
    error.response.data?.code !== "WORK_UNAVAILABLE_FOR_PERFORMER_CATEGORY"
  )
    return null;
  const ids: unknown = error.response.data.work_ids;
  return Array.isArray(ids)
    ? ids.filter((id): id is string => typeof id === "string")
    : [];
};

export const getShiftDetailSaveError = (error: unknown): string => {
  if (getUnavailableShiftWorkIds(error) !== null && isAxiosError(error)) {
    return typeof error.response?.data?.msg === "string"
      ? error.response.data.msg
      : UNAVAILABLE_SHIFT_WORK_REASON;
  }
  return getApiErrorMessage(
    error,
    "Не удалось сохранить запись отчёта по смене",
  );
};
