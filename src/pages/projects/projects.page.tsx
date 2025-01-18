import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { projectsDesktopColumns } from "./components/desktop.columns";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./projects.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { projectsMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IProjectsListColumn } from "../../interfaces/projects/IProjectsList";
import { useProjects } from "../../hooks/ApiActions/projects";
import { Link } from "react-router-dom";

export const Projects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.projectsSettings.filters
  );

  const { getProjects } = useProjects();

  React.useEffect(() => {
    getProjects();
  }, [filters]);

  const projectsData: IProjectsListColumn[] = useSelector(
    (state: IState) => state.pages.projects.data
  ).map((doc) => ({ ...doc, key: doc.project_id }));

  const isLoading = useSelector(
    (state: IState) => state.pages.projects.loading
  );
  // const statusMap = useSelector(getProjectStatusesMap);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? projectsMobileColumns(navigate)
        : projectsDesktopColumns(navigate),
    [navigate]
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[{ title: <Link to="/">Главная</Link> }, { title: "Объекты" }]}
      />
      <Content
        style={{
          padding: isMobile() ? 0 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <Filters />
        <Table
          dataSource={projectsData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
