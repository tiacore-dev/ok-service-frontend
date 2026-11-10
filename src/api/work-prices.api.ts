import { apiClient } from "./base";
import type { IWorkPrice } from "../interfaces/workPrices/IWorkPrice";
import type { IWorkPricesList } from "../interfaces/workPrices/IWorkPricesList";

export interface EditableWorkPricePayload extends Omit<
  IWorkPrice,
  "work_price_id"
> {}

interface WorkPriceMutationResponse {
  msg: string;
  work_price_id: string;
  work?: IWorkPrice;
  work_price?: IWorkPrice;
}

export const fetchWorkPrices = async (
  params: Record<string, string> = {},
): Promise<IWorkPricesList[]> => {
  const { data } = await apiClient.get<{ work_prices: IWorkPricesList[] }>(
    "/work_prices/all",
    {
      params: {
        sort_by: "category",
        sort_order: "asc",
        ...params,
      },
    },
  );
  return data.work_prices;
};

export const createWorkPrice = async (
  payload: EditableWorkPricePayload,
): Promise<IWorkPrice> => {
  const { data } = await apiClient.post<WorkPriceMutationResponse>(
    "/work_prices/add",
    payload,
  );
  return (
    data.work_price ??
    data.work ?? {
      deleted: false,
      ...payload,
      work_price_id: data.work_price_id,
    }
  );
};

export const updateWorkPrice = async (
  workPriceId: string,
  payload: EditableWorkPricePayload,
): Promise<IWorkPrice> => {
  const { data } = await apiClient.patch<WorkPriceMutationResponse>(
    `/work_prices/${workPriceId}/edit`,
    payload,
  );
  return (
    data.work_price ?? data.work ?? { ...payload, work_price_id: workPriceId }
  );
};

export const deleteWorkPrice = async (workPriceId: string): Promise<void> => {
  await apiClient.delete(`/work_prices/${workPriceId}/delete/hard`);
};
