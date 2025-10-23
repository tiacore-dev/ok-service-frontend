import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NotificationContext } from "../../../root";
import { useApi } from "../useApi";
import {
  clearCitiesState,
  getCitiesFailure,
  getCitiesRequest,
  getCitiesSuccess,
} from "../../store/modules/pages/cities.state";
import { ICitiesList } from "../../interfaces/cities/ICitiesList";
import { ICity } from "../../interfaces/cities/ICity";
import {
  clearEditableCityState,
  editCityAction,
} from "../../store/modules/editableEntities/editableCity";
import { getCitiesState } from "../../store/modules/pages/selectors/cities.selector";

export interface IEditableCity extends Pick<ICity, "name"> {}

export const useCities = () => {
  const dispatch = useDispatch();
  const notificationApi = useContext(NotificationContext);
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const citiesState = useSelector(getCitiesState);

  const getCities = (force = false) => {
    if ((force || !citiesState.loaded) && !citiesState.loading) {
      dispatch(getCitiesRequest());
      apiGet<{ cities: ICitiesList[] }>("cities", "all")
        .then((citiesData) => {
          dispatch(getCitiesSuccess(citiesData.cities));
        })
        .catch((err) => {
          dispatch(getCitiesFailure(err));
          notificationApi.error({
            message: "Ошибка",
            description: "Не удалось загрузить список городов",
            placement: "bottomRight",
            duration: 2,
          });
        });
    }
  };

  const createCity = (payload: IEditableCity) => {
    dispatch(editCityAction.sendCity());
    apiPost<{}>("cities", "add", payload)
      .then(() => {
        dispatch(clearEditableCityState());
        getCities(true);
        notificationApi.success({
          message: "Готово",
          description: "Город создан",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editCityAction.saveError());
        notificationApi.error({
          message: "Ошибка",
          description: "Не удалось создать город",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editCity = (cityId: string, payload: IEditableCity) => {
    dispatch(editCityAction.sendCity());
    apiPatch<{}>("cities", cityId, "edit", payload)
      .then(() => {
        dispatch(clearEditableCityState());
        getCities(true);
        notificationApi.success({
          message: "Готово",
          description: "Город обновлён",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editCityAction.saveError());
        notificationApi.error({
          message: "Ошибка",
          description: "Не удалось обновить город",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteCity = (cityId: string) => {
    apiDelete<{}>("cities", cityId, "delete/hard")
      .then(() => {
        getCities(true);
        notificationApi.success({
          message: "Готово",
          description: "Город удалён",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        notificationApi.error({
          message: "Ошибка",
          description: "Не удалось удалить город",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const resetCities = () => {
    dispatch(clearCitiesState());
  };

  return { getCities, createCity, editCity, deleteCity, resetCities };
};
