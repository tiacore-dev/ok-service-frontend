import {
  getProjectsFailure,
  getProjectsRequest,
  getProjectsSuccess,
} from "../../store/modules/pages/projects.state";
import { useApi } from "../useApi";
import {
  getProjectFailure,
  getProjectRequest,
  getProjectStatSuccess,
  getProjectSuccess,
} from "../../store/modules/pages/project.state";
import { IProject } from "../../interfaces/projects/IProject";
import { IProjectsList } from "../../interfaces/projects/IProjectsList";
import { useDispatch } from "react-redux";
import { editProjectAction } from "../../store/modules/editableEntities/editableProject";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { IProjectStat } from "../../interfaces/projects/IProjectStat";

export interface IEditableProject extends Omit<IProject, "project_id"> {}

export const useProjects = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);


  const getProjects = () => {
    dispatch(getProjectsRequest());
    apiGet<{ projects: IProjectsList[] }>("projects", "all")
      .then((projectsData) => {
        dispatch(getProjectsSuccess(projectsData.projects));
      })
      .catch((err) => {
        dispatch(getProjectsFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении списка спецификаций",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const getProject = (projectId: string) => {
    dispatch(getProjectRequest());
    apiGet<{ project: IProject }>("projects", `${projectId}/view`)
      .then((projectData) => {
        dispatch(getProjectSuccess(projectData.project));
      })
      .catch((err) => {
        dispatch(getProjectFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const getProjectStat = (projectId: string) => {
    dispatch(getProjectRequest());
    apiGet<{ stats: Record<string, IProjectStat> }>(
      "projects",
      `${projectId}/get-stat`,
    )
      .then((response) => {
        dispatch(getProjectStatSuccess(response.stats));
      })
      .catch(() => {
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении статистики спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const createProject = (createbleProjectData: IEditableProject) => {
    dispatch(editProjectAction.sendProject());

    apiPost<{ project: IProject }>("projects", "add", createbleProjectData)
      .then(() => {
        getProjects();
        navigate("/projects");
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация создана",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editProjectAction.saveError());
        console.log("getProjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editProject = (
    project_id: string,
    editableProjectData: IEditableProject,
  ) => {
    dispatch(editProjectAction.sendProject());

    apiPatch("projects", project_id, "edit", editableProjectData)
      .then(() => {
        navigate("/projects");
        getProjects();
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация изменена",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editProjectAction.saveError());
        console.log("editProjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteProject = (projectId: string) => {
    apiDelete("projects", projectId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация удалена",
          placement: "bottomRight",
          duration: 2,
        });
        navigate("/projects");
        getProjects();
      })
      .catch((err) => {
        console.log("deleteProjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  return {
    getProjects,
    getProject,
    createProject,
    editProject,
    deleteProject,
    getProjectStat,
  };
};
