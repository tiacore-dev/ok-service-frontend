import {
  clearObjectsState,
  getObjectsFailure,
  getObjectsRequest,
  getObjectsSuccess,
} from "../../store/modules/pages/objects.state";
import { useApi } from "../useApi";
import {
  getObjectFailure,
  getObjectRequest,
  getObjectSuccess,
} from "../../store/modules/pages/object.state";
import { IObject } from "../../interfaces/objects/IObject";
import { IObjectsList } from "../../interfaces/objects/IObjectsList";
import { useDispatch, useSelector } from "react-redux";
import { editObjectAction } from "../../store/modules/editableEntities/editableObject";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { getObjectsState } from "../../store/modules/pages/selectors/objects.selector";

export interface IEditableObject extends Omit<IObject, "object_id"> {}

export const useObjects = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const objectsState = useSelector(getObjectsState);

  const getObjects = (force?: boolean) => {
    if ((!objectsState.loaded && !objectsState.loading) || force) {
      dispatch(getObjectsRequest());
      apiGet<{ objects: IObjectsList[] }>("objects", "all")
        .then((objectsData) => {
          dispatch(getObjectsSuccess(objectsData.objects));
        })
        .catch((err) => {
          dispatch(getObjectsFailure(err));
          notificationApi.error({
            message: `Ошибка`,
            description: "Возникла ошибка при получении списка объектов",
            placement: "bottomRight",
            duration: 2,
          });
        });
    }
  };

  const getObject = (objectId: string) => {
    dispatch(getObjectRequest());
    apiGet<{ object: IObject }>("objects", `${objectId}/view`)
      .then((objectData) => {
        dispatch(getObjectSuccess(objectData.object));
      })
      .catch((err) => {
        dispatch(getObjectFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении объекта",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const createObject = (createbleObjectData: IEditableObject) => {
    dispatch(editObjectAction.sendObject());

    apiPost<{ object: IObject }>("objects", "add", createbleObjectData)
      .then(() => {
        getObjects(true);
        navigate("/objects");
        notificationApi.success({
          message: `Успешно`,
          description: "Объект создан",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editObjectAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании объекта",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editObject = (
    object_id: string,
    editableObjectData: IEditableObject
  ) => {
    dispatch(editObjectAction.sendObject());

    apiPatch<{}>("objects", object_id, "edit", editableObjectData)
      .then(() => {
        navigate("/objects");
        dispatch(clearObjectsState())
        getObjects();
        notificationApi.success({
          message: `Успешно`,
          description: "Объект изменен",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editObjectAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении объекта",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteObject = (objectId: string) => {
    apiDelete<{}>("objects", objectId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Объект удалён",
          placement: "bottomRight",
          duration: 2,
        });
        navigate("/objects");
        getObjects(true);
      })
      .catch((err) => {
        console.log("deleteObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении объекта",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  return { getObjects, getObject, createObject, editObject, deleteObject };
};
