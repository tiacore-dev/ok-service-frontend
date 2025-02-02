import {
  getWorkCategoriesFailure,
  getWorkCategoriesRequest,
  getWorkCategoriesSuccess,
} from "../../store/modules/pages/work-categories.state";
import { useApi } from "../useApi";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { IWorkCategory } from "../../interfaces/workCategories/IWorkCategory";
import { IWorkCategoriesList } from "../../interfaces/workCategories/IWorkCategoriesList";

export interface IEditableWorkCategory
  extends Omit<IWorkCategory, "work_category_id"> {}

export const useWorkCategories = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const notificationApi = useContext(NotificationContext);

  const getWorkCategories = () => {
    dispatch(getWorkCategoriesRequest());
    apiGet<{ work_categories: IWorkCategoriesList[] }>("work_categories", "all")
      .then((workCategoriesData) => {
        dispatch(getWorkCategoriesSuccess(workCategoriesData.work_categories));
      })
      .catch((err) => {
        dispatch(getWorkCategoriesFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении списка категорий работ",
          placement: "bottomRight",
        });
      });
  };

  const createWorkCategory = (
    createbleWorkCategoryData: IEditableWorkCategory
  ) => {
    apiPost<{ work: IWorkCategory }>(
      "work_categories",
      "add",
      createbleWorkCategoryData
    )
      .then(() => {
        getWorkCategories();
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ создана",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании категории работы",
          placement: "bottomRight",
        });
      });
  };

  const editWorkCategory = (
    work_category_id: string,
    editableWorkCategoryData: IEditableWorkCategory
  ) => {
    apiPatch<{}>(
      "work_categories",
      work_category_id,
      "edit",
      editableWorkCategoryData
    )
      .then(() => {
        getWorkCategories();
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении категории работы",
          placement: "bottomRight",
        });
      });
  };

  const deleteWorkCategory = (work_category_id: string) => {
    apiDelete<{}>("work_categories", work_category_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Категория работ удалена",
          placement: "bottomRight",
        });
        getWorkCategories();
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении категории работы",
          placement: "bottomRight",
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
