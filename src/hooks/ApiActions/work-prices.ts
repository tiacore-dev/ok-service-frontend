import {
  getWorkPricesFailure,
  getWorkPricesRequest,
  getWorkPricesSuccess,
} from "../../store/modules/pages/work-prices.state";
import { useApi } from "../useApi";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
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
      params
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
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании цены работы",
          placement: "bottomRight",
        });
      });
  };

  const editWorkPrice = (
    work_price_id: string,
    editableWorkPriceData: IEditableWorkPrice
  ) => {
    apiPatch<{}>("work_prices", work_price_id, "edit", editableWorkPriceData)
      .then(() => {
        getWorkPrices({ work: editableWorkPriceData.work });
        notificationApi.success({
          message: `Успешно`,
          description: "Цена работ изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении цены работы",
          placement: "bottomRight",
        });
      });
  };

  const deleteWorkPrice = (work_price_id: string, work_id: string) => {
    apiDelete<{}>("work_prices", work_price_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Цена работ удалена",
          placement: "bottomRight",
        });
        getWorkPrices({ work: work_id });
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении цены работы",
          placement: "bottomRight",
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
