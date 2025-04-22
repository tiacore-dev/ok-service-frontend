import React, { useCallback, useState } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Select, Space } from "antd";
import { IUser } from "../../../interfaces/users/IUser";
import {
  clearCreateUserState,
  editUserAction,
} from "../../../store/modules/editableEntities/editableUser";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableUserDialog.less";
import { IEditableUser, useUsers } from "../../../hooks/ApiActions/users";
import { getRoles } from "../../../store/modules/dictionaries/selectors/roles.selector";
import { RoleId } from "../../../interfaces/roles/IRole";
import { categoryMap } from "../../../utils/categoryMap";
import { getModalContentWidth } from "../../../utils/pageSettings";

const modalContentWidth = getModalContentWidth();
interface IEditableUserDialogProps {
  user?: IUser;
  iconOnly?: boolean;
}

export const EditableUserDialog = (props: IEditableUserDialogProps) => {
  const { user, iconOnly } = props;
  const [password, setPassword] = useState<string>("");
  const { createUser, editUser } = useUsers();
  const buttonText = user ? "Редактировать" : "Создать";
  const popoverText = user
    ? "Редактировать пользователя"
    : "Создать пользователя";
  const buttonIcon = user ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = user
    ? "Редактирование пользователя"
    : "Создание нового пользователя";

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableUser,
  );
  const rolesMap = useSelector(getRoles).map((el) => ({
    label: el.name,
    value: el.role_id,
  }));

  const { sent: _sent, ...createUserData } = data;

  const editUserData: IEditableUser = { ...createUserData };

  if (password) {
    editUserData.password = password;
  }

  const handleConfirm = useCallback(() => {
    if (user) {
      editUser(user.user_id, editUserData);
    } else {
      createUser({ ...createUserData, password });
    }
  }, [user, editUserData, createUserData, password]);

  const handeOpen = useCallback(() => {
    if (user) {
      dispatch(editUserAction.setUserData(user));
    } else {
      dispatch(clearCreateUserState());
    }
  }, [user, dispatch]);

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handeOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly && popoverText}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_user_dialog">
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Имя"
            >
              <Input
                value={data.name}
                onChange={(event) =>
                  dispatch(editUserAction.setName(event.target.value))
                }
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Разряд"
            >
              <Select
                value={data.category}
                onChange={(value: number) =>
                  dispatch(editUserAction.setCategory(value))
                }
                options={categoryMap}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Логин"
            >
              <Input
                value={data.login}
                onChange={(event) =>
                  dispatch(editUserAction.setLogin(event.target.value))
                }
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Пароль"
            >
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Роль"
            >
              <Select
                value={data.role}
                onChange={(value: RoleId) =>
                  dispatch(editUserAction.setRole(value))
                }
                options={rolesMap}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
