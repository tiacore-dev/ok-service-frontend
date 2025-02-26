import { Breadcrumb, Layout, Table, TablePaginationConfig } from "antd";
import * as React from "react";
import { projectsDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./projects.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { projectsMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { useProjects } from "../../hooks/ApiActions/projects";
import { Link } from "react-router-dom";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useUsers } from "../../hooks/ApiActions/users";
import { clearProjectsState } from "../../store/modules/pages/projects.state";
import { getProjectsState } from "../../store/modules/pages/selectors/projects.selector";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { IProjectsListColumn } from "../../interfaces/projects/IProjectsList";
import { saveProjectsTableState } from "../../store/modules/settings/projects";

export const Projects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.projectsSettings.filters
  );
  const dispatch = useDispatch();

  const { getProjects } = useProjects();
  const { getObjects } = useObjects();
  const { getUsers } = useUsers();

  const tableState = useSelector((state: IState) => state.settings.projectsSettings);

  const handleTableChange = React.useCallback((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<IProjectsListColumn>) => {
    const currentState = { pagination, filters, sorter };
    dispatch(saveProjectsTableState(currentState));
  }, []);

  React.useEffect(() => {
    getObjects();
    getUsers();
    getProjects();

    return () => {
      dispatch(clearProjectsState());
    };
  }, []);

  const projectsState = useSelector(getProjectsState);
  const projectsData = React.useMemo(
    () => projectsState.data.map((doc) => ({ ...doc, key: doc.project_id })),
    [projectsState]
  );

  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);

  const isLoading = useSelector(
    (state: IState) => state.pages.projects.loading
  );

  const columns = React.useMemo(
    () =>
      isMobile()
        ? projectsMobileColumns(navigate, objectsMap, usersMap)
        : projectsDesktopColumns(navigate, objectsMap, usersMap, tableState),
    [navigate, objectsMap, usersMap, tableState]
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Спецификации" },
        ]}
      />
      <Content
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <Filters />
        <Table
          onChange={handleTableChange}
          dataSource={projectsData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
