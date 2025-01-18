import {
  getProjectsFailure,
  getProjectsRequest,
  getProjectsSuccess,
} from "../../store/modules/pages/projects.state";
import { useApi } from "../useApi";
import {
  getProjectFailure,
  getProjectRequest,
  getProjectSuccess,
} from "../../store/modules/pages/project.state";
import { IProject } from "../../interfaces/projects/IProject";
import { IProjectsList } from "../../interfaces/projects/IProjectsList";
import { useDispatch } from "react-redux";
import { editProjectAction } from "../../store/modules/editableEntities/editableProject";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../../../root";

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
      });
  };

  const createProject = (createbleProjectData: IEditableProject) => {
    dispatch(editProjectAction.sendProject());

    apiPost<{ project: IProject }>("projects", "add", createbleProjectData)
      .then(() => {
        navigate("/projects");
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация создана",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editProjectAction.saveError());
        console.log("getProjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании спецификации",
          placement: "bottomRight",
        });
      });
  };

  const editProject = (
    project_id: string,
    editableProjectData: IEditableProject
  ) => {
    dispatch(editProjectAction.sendProject());

    apiPatch<{}>("projects", project_id, "edit", editableProjectData)
      .then(() => {
        navigate("/projects");
        getProjects();
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editProjectAction.saveError());
        console.log("editProjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении спецификации",
          placement: "bottomRight",
        });
      });
  };

  const deleteProject = (projectId: string) => {
    apiDelete<{}>("projects", projectId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Спецификация удалена",
          placement: "bottomRight",
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
        });
      });
  };

  return { getProjects, getProject, createProject, editProject, deleteProject };
};
