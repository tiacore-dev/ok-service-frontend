import * as React from "react";
import { Breadcrumb, Card, Layout, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useProjects } from "../../hooks/ApiActions/projects";
import { EditableProjectDialog } from "../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { DeleteProjectDialog } from "../../components/ActionDialogs/DeleteProjectDialog";
import { Link } from "react-router-dom";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";

export const Project = () => {
  const { Content } = Layout;
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);

  const routeParams = useParams();
  const { getProject, deleteProject } = useProjects();

  React.useEffect(() => {
    getProject(routeParams.projectId);
  }, []);

  const projectData = useSelector((state: IState) => state.pages.project.data);
  const isLoaded = useSelector((state: IState) => state.pages.project.loaded);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/projects">Спецификации</Link>,
          },
          { title: projectData?.name },
        ]}
      />
      {isLoaded &&
      projectData &&
      routeParams.projectId === projectData.project_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{projectData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            <EditableProjectDialog project={projectData} />
            <DeleteProjectDialog
              onDelete={() => {
                deleteProject(projectData.project_id);
              }}
              name={projectData.name}
            />
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {projectData.name}</p>
            <p>ID: {projectData.project_id}</p>
            <p>Объект: {objectsMap[projectData.object]?.name}</p>
            <p>Прораб: {usersMap[projectData.project_leader]?.name}</p>
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
