import {
  getUsersFailure,
  getUsersRequest,
  getUsersSuccess,
} from "../../store/modules/pages/users.state";
import { useApi } from "../useApi";
import {
  getUserFailure,
  getUserRequest,
  getUserSuccess,
} from "../../store/modules/pages/user.state";
import { IUser } from "../../interfaces/users/IUser";
import { IUsersList } from "../../interfaces/users/IUsersList";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { editUserAction } from "../../store/modules/editableEntities/editableUser";
import { useNavigate } from "react-router-dom";

export interface IEditableUser extends Omit<IUser, "user_id"> {
  password?: string;
}

export const useUsers = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const getUsers = () => {
    dispatch(getUsersRequest());
    apiGet<{ users: IUsersList[] }>("users", "all")
      .then((usersData) => {
        dispatch(getUsersSuccess(usersData.users));
      })
      .catch((err) => {
        dispatch(getUsersFailure(err));
      });
  };

  const getUser = (userId: string) => {
    dispatch(getUserRequest());
    apiGet<{ user: IUser }>("users", `${userId}/view`)
      .then((userData) => {
        dispatch(getUserSuccess(userData.user));
      })
      .catch((err) => {
        dispatch(getUserFailure(err));
      });
  };

  const createUser = (createbleUserData: IEditableUser) => {
    dispatch(editUserAction.sendUser());

    apiPost<{ user: IUser }>("users", "add", createbleUserData)
      .then(() => {
        navigate("/users");
        getUsers();
        notificationApi.success({
          message: `Успешно`,
          description: "Объект создан",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editUserAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании объекта",
          placement: "bottomRight",
        });
      });
  };

  const editUser = (user_id: string, editableUserData: IEditableUser) => {
    dispatch(editUserAction.sendUser());

    apiPatch<{}>("users", user_id, "edit", editableUserData)
      .then(() => {
        navigate("/users");
        getUsers();
        notificationApi.success({
          message: `Успешно`,
          description: "Пользователь изменен",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editUserAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении пользователя",
          placement: "bottomRight",
        });
      });
  };

  const deleteUser = (userId: string) => {
    apiDelete<{}>("users", userId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Пользователь удалён",
          placement: "bottomRight",
        });
        navigate("/users");
        getUsers();
      })
      .catch((err) => {
        console.log("deleteUserFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении пользователя",
          placement: "bottomRight",
        });
      });
  };

  return { getUsers, getUser, createUser, editUser, deleteUser };
};
