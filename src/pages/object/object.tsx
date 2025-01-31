import * as React from "react";
import { Breadcrumb, Card, Layout, Space } from "antd";
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

export const Object = () => {
  const { Content } = Layout;
  const objectStatusesMap = useSelector(getObjectStatusesMap);
  const routeParams = useParams();
  const { getObject, deleteObject } = useObjects();

  React.useEffect(() => {
    getObject(routeParams.objectId);
  }, []);

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
            <EditableObjectDialog object={objectData} />
            <DeleteObjectDialog
              onDelete={() => {
                deleteObject(objectData.object_id);
              }}
              name={objectData.name}
            />
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {objectData.name}</p>
            <p>ID: {objectData.object_id}</p>
            <p>Адрес: {objectData.address}</p>
            <p>Описание: {objectData.description}</p>
            <p>Статус: {objectStatusesMap[objectData.status]?.name}</p>
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
