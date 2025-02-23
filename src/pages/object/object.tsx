import * as React from "react";
import { Breadcrumb, Card, Layout, Space, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useObjects } from "../../hooks/ApiActions/objects";
import { EditableObjectDialog } from "../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { DeleteObjectDialog } from "../../components/ActionDialogs/DeleteObjectDialog";
import { getObjectStatusesMap } from "../../store/modules/dictionaries/selectors/objectStatuses.selector";
import { Link } from "react-router-dom";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";

export const Object = () => {
  const { Content } = Layout;
  const objectStatusesMap = useSelector(getObjectStatusesMap);
  const routeParams = useParams();
  const { getObject, deleteObject } = useObjects();
  const usersMap = useSelector(getUsersMap);

  React.useEffect(() => {
    getObject(routeParams.objectId);
  }, []);
  const currentRole = useSelector(getCurrentRole);
  const objectData = useSelector((state: IState) => state.pages.object.data);
  const isLoaded = useSelector((state: IState) => state.pages.object.loaded);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/objects">Объекты</Link>,
          },
          { title: objectData?.name },
        ]}
      />
      {isLoaded &&
      objectData &&
      routeParams.objectId === objectData.object_id ? (
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
                onDelete={() => {
                  deleteObject(objectData.object_id);
                }}
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
        </Content>
      ) : (
        <Spin />
      )}
    </>
  );
};
