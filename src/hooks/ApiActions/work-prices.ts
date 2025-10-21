import {
  getWorkPricesFailure,
  getWorkPricesRequest,
  getWorkPricesSuccess,
} from "../../store/modules/pages/work-prices.state";
import { useApi } from "../useApi";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { IWorkPrice } from "../../interfaces/workPrices/IWorkPrice";
import { IWorkPricesList } from "../../interfaces/workPrices/IWorkPricesList";

export interface IEditableWorkPrice extends Omit<IWorkPrice, "work_price_id"> {}

export const useWorkPrices = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const notificationApi = useContext(NotificationContext);

  const getWorkPrices = (params: Record<string, string>) => {
    dispatch(getWorkPricesRequest());
    apiGet<{ work_prices: IWorkPricesList[] }>(
      "work_prices",
      "all",
      undefined,
      { ...params, sort_by: "category", sort_order: "asc" },
    )
      .then((workPricesData) => {
        dispatch(getWorkPricesSuccess(workPricesData.work_prices));
      })
      .catch((err) => {
        dispatch(getWorkPricesFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении списка цен работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const createWorkPrice = (createbleWorkPriceData: IEditableWorkPrice) => {
    apiPost<{ work: IWorkPrice }>("work_prices", "add", createbleWorkPriceData)
      .then(() => {
        getWorkPrices({ work: createbleWorkPriceData.work });
        notificationApi.success({
          message: `Успешно`,
          description: "Цена работ создана",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании цены работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editWorkPrice = (
    work_price_id: string,
    editableWorkPriceData: IEditableWorkPrice,
  ) => {
    apiPatch<void>("work_prices", work_price_id, "edit", editableWorkPriceData)
      .then(() => {
        getWorkPrices({ work: editableWorkPriceData.work });
        notificationApi.success({
          message: `Успешно`,
          description: "Цена работ изменена",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении цены работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteWorkPrice = (work_price_id: string, work_id: string) => {
    apiDelete<void>("work_prices", work_price_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Цена работ удалена",
          placement: "bottomRight",
          duration: 2,
        });
        getWorkPrices({ work: work_id });
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении цены работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  return {
    getWorkPrices,
    createWorkPrice,
    editWorkPrice,
    deleteWorkPrice,
  };
};
