import {
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
import { IObjectList } from "../../interfaces/objects/IObjectList";
import { useDispatch } from "react-redux";
import { editObjectAction } from "../../store/modules/editableEntities/editableObject";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../../../root";

export interface ICreateObject extends Omit<IObject, "id"> {}

export const useObjects = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const getObjects = () => {
    dispatch(getObjectsRequest());
    apiGet<{ objects: IObjectList[] }>("objects", "all")
      .then((objectsData) => {
        console.log("getObjects", objectsData.objects);
        dispatch(getObjectsSuccess(objectsData.objects));
      })
      .catch((err) => {
        dispatch(getObjectsFailure(err));
      });
  };

  const getObject = (objectId: string) => {
    dispatch(getObjectRequest());
    apiGet<{ objects: IObject }>("objects", `${objectId}/view`)
      .then((objectData) => {
        dispatch(getObjectSuccess(objectData.objects));
      })
      .catch((err) => {
        dispatch(getObjectFailure(err));
      });
  };

  const createObject = (createbleObjectData: ICreateObject) => {
    dispatch(editObjectAction.sendObject());

    apiPost<{ object: IObject }>("objects", "add", createbleObjectData)
      .then(() => {
        navigate("/objects");
        notificationApi.success({
          message: `Успешно`,
          description: "Объект создан",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editObjectAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании объекта",
          placement: "bottomRight",
        });
      });
  };

  return { getObjects, getObject, createObject };
};
