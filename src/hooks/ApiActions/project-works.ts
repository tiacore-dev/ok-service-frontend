import {
  getProjectWorksFailure,
  getProjectWorksRequest,
  getProjectWorksSuccess,
} from "../../store/modules/pages/project-works.state";
import { useApi } from "../useApi";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { IProjectWork } from "../../interfaces/projectWorks/IProjectWork";
import { IProjectWorksList } from "../../interfaces/projectWorks/IProjectWorksList";

export interface IEditableProjectWork
  extends Omit<IProjectWork, "project_work_id"> {}

export const useProjectWorks = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const notificationApi = useContext(NotificationContext);

  const getProjectWorks = () => {
    dispatch(getProjectWorksRequest());
    apiGet<{ project_works: IProjectWorksList[] }>("project_works", "all")
      .then((projectWorksData) => {
        dispatch(getProjectWorksSuccess(projectWorksData.project_works));
      })
      .catch((err) => {
        dispatch(getProjectWorksFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description:
            "Возникла ошибка при получении списка работ по спецификации",
          placement: "bottomRight",
        });
      });
  };

  const createProjectWork = (
    createbleProjectWorkData: IEditableProjectWork
  ) => {
    apiPost<{ work: IProjectWork }>(
      "project_works",
      "add",
      createbleProjectWorkData
    )
      .then(() => {
        getProjectWorks();
        notificationApi.success({
          message: `Успешно`,
          description: "Работа добавлена в спецификацию",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при добавлении работы в спецификацию",
          placement: "bottomRight",
        });
      });
  };

  const editProjectWork = (
    project_work_id: string,
    editableProjectWorkData: IEditableProjectWork
  ) => {
    apiPatch<{}>(
      "project_works",
      project_work_id,
      "edit",
      editableProjectWorkData
    )
      .then(() => {
        getProjectWorks();
        notificationApi.success({
          message: `Успешно`,
          description: "Работ в спецификации изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении работы в спецификации",
          placement: "bottomRight",
        });
      });
  };

  const deleteProjectWork = (project_work_id: string) => {
    apiDelete<{}>("project_works", project_work_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Работа удалена из спецификации",
          placement: "bottomRight",
        });
        getProjectWorks();
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении работы из спецификации",
          placement: "bottomRight",
        });
      });
  };

  return {
    getProjectWorks,
    createProjectWork,
    editProjectWork,
    deleteProjectWork,
  };
};
