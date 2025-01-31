import {
  getWorksFailure,
  getWorksRequest,
  getWorksSuccess,
} from "../../store/modules/pages/works.state";
import { useApi } from "../useApi";
import {
  getWorkFailure,
  getWorkRequest,
  getWorkSuccess,
} from "../../store/modules/pages/work.state";
import { IWork } from "../../interfaces/works/IWork";
import { IWorksList } from "../../interfaces/works/IWorksList";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { editWorkAction } from "../../store/modules/editableEntities/editableWork";
import { useNavigate } from "react-router-dom";

export interface IEditableWork extends Omit<IWork, "work_id" | "category"> {
  category: string;
}

export const useWorks = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const getWorks = () => {
    dispatch(getWorksRequest());
    apiGet<{ works: IWorksList[] }>("works", "all")
      .then((worksData) => {
        dispatch(getWorksSuccess(worksData.works));
      })
      .catch((err) => {
        dispatch(getWorksFailure(err));
      });
  };

  const getWork = (workId: string) => {
    dispatch(getWorkRequest());
    apiGet<{ work: IWork }>("works", `${workId}/view`)
      .then((workData) => {
        dispatch(getWorkSuccess(workData.work));
      })
      .catch((err) => {
        dispatch(getWorkFailure(err));
      });
  };

  const createWork = (createbleWorkData: IEditableWork) => {
    dispatch(editWorkAction.sendWork());

    apiPost<{ work: IWork }>("works", "add", createbleWorkData)
      .then(() => {
        navigate("/works");
        getWorks();
        notificationApi.success({
          message: `Успешно`,
          description: "Работа создана",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editWorkAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании работы",
          placement: "bottomRight",
        });
      });
  };

  const editWork = (work_id: string, editableWorkData: IEditableWork) => {
    dispatch(editWorkAction.sendWork());

    apiPatch<{}>("works", work_id, "edit", editableWorkData)
      .then(() => {
        navigate("/works");
        getWorks();
        notificationApi.success({
          message: `Успешно`,
          description: "Работа изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editWorkAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении работы",
          placement: "bottomRight",
        });
      });
  };

  const deleteWork = (workId: string) => {
    apiDelete<{}>("works", workId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Работа удалена",
          placement: "bottomRight",
        });
        navigate("/works");
        getWorks();
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении работы",
          placement: "bottomRight",
        });
      });
  };

  return { getWorks, getWork, createWork, editWork, deleteWork };
};
