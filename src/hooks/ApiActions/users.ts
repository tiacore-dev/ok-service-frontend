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
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { editUserAction } from "../../store/modules/editableEntities/editableUser";
import { useNavigate } from "react-router-dom";
import { getUsersState } from "../../store/modules/pages/selectors/users.selector";

export interface IEditableUser extends Omit<IUser, "user_id"> {
  password?: string;
}

export const useUsers = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const usersState = useSelector(getUsersState);

  const getUsers = () => {
    if (!usersState.loaded && !usersState.loading) {
      dispatch(getUsersRequest());
      apiGet<{ users: IUsersList[] }>("users", "all")
        .then((usersData) => {
          dispatch(getUsersSuccess(usersData.users));
        })
        .catch((err) => {
          dispatch(getUsersFailure(err));
          notificationApi.error({
            message: `Ошибка`,
            description: "Возникла ошибка при получении списка пользователей",
            placement: "bottomRight",
            duration: 2,
          });
        });
    }
  };

  const getUser = (userId: string) => {
    dispatch(getUserRequest());
    apiGet<{ user: IUser }>("users", `${userId}/view`)
      .then((userData) => {
        dispatch(getUserSuccess(userData.user));
      })
      .catch((err) => {
        dispatch(getUserFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении пользователя",
          placement: "bottomRight",
          duration: 2,
        });
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
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editUserAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании объекта",
          placement: "bottomRight",
          duration: 2,
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
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editUserAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении пользователя",
          placement: "bottomRight",
          duration: 2,
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
          duration: 2,
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
          duration: 2,
        });
      });
  };

  return { getUsers, getUser, createUser, editUser, deleteUser };
};
