import * as React from "react";
import { Breadcrumb, Card, Layout, Space, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { EditableObjectDialog } from "../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { DeleteObjectDialog } from "../../components/ActionDialogs/DeleteObjectDialog";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { useUsersMap } from "../../queries/users";
import { Projects } from "./projects/projects.page";
import {
  useDeleteObjectMutation,
  useObjectQuery,
} from "../../queries/objects";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useContext, useMemo } from "react";
import { useObjectStatuses } from "../../queries/objectStatuses";

export const Object = () => {
  const { Content } = Layout;
  const routeParams = useParams();
  const navigate = useNavigate();
  const { usersMap } = useUsersMap();
  const { statusMap: objectStatusesMap } = useObjectStatuses();
  const notificationApi = useContext(NotificationContext);
  const objectId = routeParams.objectId;
  const { data: objectData, isPending, isFetching } = useObjectQuery(objectId, {
    enabled: Boolean(objectId),
  });
  const { mutateAsync: deleteObjectMutation } = useDeleteObjectMutation();
  const currentRole = useSelector(getCurrentRole);

  const isLoaded = useMemo(
    () => Boolean(objectData && objectId === objectData.object_id),
    [objectData, objectId],
  );

  const handleDelete = React.useCallback(async () => {
    if (!objectData?.object_id) return;
    try {
      await deleteObjectMutation(objectData.object_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Объект удалён",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/objects");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении объекта";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [deleteObjectMutation, notificationApi, objectData, navigate]);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/objects">Объекты</Link>,
          },
          { title: objectData?.name },
        ]}
      />
      {isLoaded &&
      objectData &&
      objectId === objectData.object_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{objectData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole === RoleId.ADMIN && (
              <EditableObjectDialog object={objectData} />
            )}
            {currentRole === RoleId.ADMIN && (
              <DeleteObjectDialog
                onDelete={handleDelete}
                name={objectData.name}
              />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {objectData.name}</p>
            <p>Адрес: {objectData.address}</p>
            <p>Описание: {objectData.description}</p>
            <p>Менеджер: {usersMap[objectData.manager]?.name}</p>
            <p>Статус: {objectStatusesMap[objectData.status]?.name}</p>
          </Card>
          {objectData.object_id && (
            <Projects object_id={objectData.object_id} />
          )}
        </Content>
      ) : (
        <Spin spinning={isPending || isFetching} />
      )}
    </>
  );
};
