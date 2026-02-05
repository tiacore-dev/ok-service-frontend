"use client";

import * as React from "react";
import { Breadcrumb, Card, Layout, Space, Spin } from "antd";
import { RollbackOutlined, DeleteTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { EditableUserDialog } from "../../components/ActionDialogs/EditableUserDialog/EditableUserDialog";
import { DeleteUserDialog } from "../../components/ActionDialogs/DeleteUserDialog";
import { ActionDialog } from "../../components/ActionDialogs/ActionDialog";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useUserQuery,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useHardDeleteUserMutation,
} from "../../queries/users";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useContext, useMemo } from "react";
import { useRoles } from "../../queries/roles";
import { useCitiesMap } from "../../queries/cities";

export const User = () => {
  const { Content } = Layout;
  const { rolesMap } = useRoles();
  const routeParams = useParams();
  const currentRole = useSelector(getCurrentRole);
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);
  const { mutateAsync: deleteUser } = useDeleteUserMutation();
  const { mutateAsync: restoreUser } = useRestoreUserMutation();
  const { mutateAsync: hardDeleteUser } = useHardDeleteUserMutation();
  const { citiesMap } = useCitiesMap();
  const userId = routeParams.userId;
  const {
    data: userData,
    isPending,
    isFetching,
  } = useUserQuery(userId, {
    enabled: Boolean(userId),
  });

  const isLoaded = useMemo(
    () => Boolean(userData && userId === userData.user_id),
    [userData, userId],
  );

  const handleDelete = React.useCallback(async () => {
    if (!userData) {
      return;
    }

    try {
      await deleteUser(userData.user_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Пользователь удалён",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/users");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении пользователя";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [userData, deleteUser, notificationApi, navigate]);

  const handleRestore = React.useCallback(async () => {
    if (!userData) {
      return;
    }

    try {
      await restoreUser(userData.user_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Пользователь восстановлен",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при восстановлении пользователя";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [userData, restoreUser, notificationApi]);

  const handleHardDelete = React.useCallback(async () => {
    if (!userData) {
      return;
    }

    try {
      await hardDeleteUser(userData.user_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Пользователь удален навсегда",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/users");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении пользователя";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [userData, hardDeleteUser, notificationApi, navigate]);

  const isLoading = isPending || isFetching;

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/users">Пользователи</Link>,
          },
          { title: userData?.name },
        ]}
      />
      {isLoaded && userData ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{userData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole === RoleId.ADMIN && (
              <EditableUserDialog user={userData} />
            )}
            {currentRole === RoleId.ADMIN && !userData.deleted && (
              <DeleteUserDialog onDelete={handleDelete} name={userData.name} />
            )}
            {currentRole === RoleId.ADMIN && userData.deleted && (
              <>
                <ActionDialog
                  buttonText="Восстановить"
                  buttonType="primary"
                  buttonIcon={<RollbackOutlined />}
                  modalTitle={`Подтверждение восстановления пользователя ${userData.name}`}
                  modalText={
                    <p>
                      Вы действительно хотите восстановить пользователя{" "}
                      {userData.name}?
                    </p>
                  }
                  onConfirm={handleRestore}
                />
                <ActionDialog
                  buttonText="Удалить насовсем"
                  buttonType="default"
                  buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
                  modalTitle={`Подтверждение удаления пользователя ${userData.name}`}
                  modalText={
                    <p>
                      Вы действительно хотите удалить пользователя{" "}
                      {userData.name} навсегда?
                    </p>
                  }
                  onConfirm={handleHardDelete}
                />
              </>
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Имя: {userData.name}</p>
            <p>Разряд: {userData.category ?? "Нет разряда"}</p>
            <p>Логин: {userData.login}</p>
            <p>Город: {userData.city ? citiesMap[userData.city]?.name : "—"}</p>
            <p>Роль: {rolesMap[userData.role]?.name}</p>
            {userData.deleted && <p>Удалён</p>}
          </Card>
        </Content>
      ) : (
        <Spin spinning={isLoading} />
      )}
    </>
  );
};
