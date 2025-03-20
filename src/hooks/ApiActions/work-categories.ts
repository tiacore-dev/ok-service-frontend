import {
  getWorkCategoriesFailure,
  getWorkCategoriesRequest,
  getWorkCategoriesSuccess,
} from "../../store/modules/pages/work-categories.state";
import { useApi } from "../useApi";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { IWorkCategory } from "../../interfaces/workCategories/IWorkCategory";
import { IWorkCategoriesList } from "../../interfaces/workCategories/IWorkCategoriesList";
import { getWorkCategoriesState } from "../../store/modules/pages/selectors/work-categories.selector";

export interface IEditableWorkCategory
  extends Omit<IWorkCategory, "work_category_id"> {}

export const useWorkCategories = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const notificationApi = useContext(NotificationContext);

  const workCategoriesState = useSelector(getWorkCategoriesState);

  const getWorkCategories = (force?: boolean) => {
    if (
      (!workCategoriesState.loaded && !workCategoriesState.loading) ||
      force
    ) {
      dispatch(getWorkCategoriesRequest());
      apiGet<{ work_categories: IWorkCategoriesList[] }>(
        "work_categories",
        "all",
        undefined,
        { sort_by: "created_at" },
      )
        .then((workCategoriesData) => {
          dispatch(
            getWorkCategoriesSuccess(workCategoriesData.work_categories),
          );
        })
        .catch((err) => {
          dispatch(getWorkCategoriesFailure(err));
          notificationApi.error({
            message: `Ошибка`,
            description: "Возникла ошибка при получении списка категорий работ",
            placement: "bottomRight",
            duration: 2,
          });
        });
    }
  };

  const createWorkCategory = (
    createbleWorkCategoryData: IEditableWorkCategory,
  ) => {
    apiPost<{ work: IWorkCategory }>(
      "work_categories",
      "add",
      createbleWorkCategoryData,
    )
      .then(() => {
        getWorkCategories(true);
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ создана",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании категории работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editWorkCategory = (
    work_category_id: string,
    editableWorkCategoryData: IEditableWorkCategory,
  ) => {
    apiPatch(
      "work_categories",
      work_category_id,
      "edit",
      editableWorkCategoryData,
    )
      .then(() => {
        getWorkCategories(true);
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ изменена",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении категории работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteWorkCategory = (work_category_id: string) => {
    apiDelete("work_categories", work_category_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ удалена",
          placement: "bottomRight",
          duration: 2,
        });
        getWorkCategories(true);
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении категории работы",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  return {
    getWorkCategories,
    createWorkCategory,
    editWorkCategory,
    deleteWorkCategory,
  };
};
