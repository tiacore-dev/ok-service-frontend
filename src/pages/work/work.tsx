import * as React from "react";
import { Breadcrumb, Card, Layout, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { useWorks } from "../../hooks/ApiActions/works";
import { EditableWorkDialog } from "../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { DeleteWorkDialog } from "../../components/ActionDialogs/DeleteWorkDialog";

export const Work = () => {
  const { Content } = Layout;
  const routeParams = useParams();
  const { getWork, deleteWork } = useWorks();

  React.useEffect(() => {
    getWork(routeParams.workId);
  }, []);

  const workData = useSelector((state: IState) => state.pages.work.data);
  const isLoaded = useSelector((state: IState) => state.pages.work.loaded);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/works">Пользователи</Link>,
          },
          { title: workData?.name },
        ]}
      />
      {isLoaded && workData && routeParams.workId === workData.work_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{workData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            <EditableWorkDialog work={workData} />
            <DeleteWorkDialog
              onDelete={() => {
                deleteWork(workData.work_id);
              }}
              name={workData.name}
            />
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Имя: {workData.name}</p>
            <p>Категория: {workData.category}</p>
            <p>ID: {workData.work_id}</p>
            <p>Единица измерения: {workData.measurement_unit}</p>
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
