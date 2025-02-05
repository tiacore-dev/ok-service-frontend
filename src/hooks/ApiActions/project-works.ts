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

  const getProjectWorks = (project_id?: string) => {
    if (project_id) {
      dispatch(getProjectWorksRequest());
      apiGet<{ project_works: IProjectWorksList[] }>(
        "project_works",
        "all",
        undefined,
        { project: project_id }
      )
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
            duration: 2,
          });
        });
    }
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
        getProjectWorks(createbleProjectWorkData.project);
        notificationApi.success({
          message: `Успешно`,
          description: "Работа добавлена в спецификацию",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при добавлении работы в спецификацию",
          placement: "bottomRight",
          duration: 2,
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
        getProjectWorks(editableProjectWorkData.project);
        notificationApi.success({
          message: `Успешно`,
          description: "Работ в спецификации изменена",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении работы в спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteProjectWork = (project_work_id: string, project_id: string) => {
    apiDelete<{}>("project_works", project_work_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Работа удалена из спецификации",
          placement: "bottomRight",
          duration: 2,
        });
        getProjectWorks(project_id);
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении работы из спецификации",
          placement: "bottomRight",
          duration: 2,
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
