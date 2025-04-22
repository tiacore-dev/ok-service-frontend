import { Space, Table, TablePaginationConfig } from "antd";
import * as React from "react";
import { projectsDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import "./projects.page.less";
import { useNavigate } from "react-router-dom";
import { projectsMobileColumns } from "./components/mobile.columns";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { EditableProjectDialog } from "../../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";
import { IState } from "../../../store/modules";
import { IProjectsListColumn } from "../../../interfaces/projects/IProjectsList";
import { saveProjectsTableState } from "../../../store/modules/settings/projects";
import { getProjectsState } from "../../../store/modules/pages/selectors/projects.selector";
import { isMobile } from "../../../utils/isMobile";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";

export const Projects = ({ object_id }: { object_id: string }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentRole = useSelector(getCurrentRole);

  const tableState = useSelector(
    (state: IState) => state.settings.projectsSettings,
  );

  const handleTableChange = React.useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<IProjectsListColumn>,
    ) => {
      const currentState = { pagination, filters, sorter };
      dispatch(saveProjectsTableState(currentState));
    },
    [],
  );

  const projectsState = useSelector(getProjectsState);
  const projectsData = React.useMemo(
    () =>
      projectsState.data
        .filter((doc) => doc.object === object_id)
        .map((doc) => ({ ...doc, key: doc.project_id })),
    [projectsState],
  );

  const usersMap = useSelector(getUsersMap);

  const isLoading = useSelector(
    (state: IState) => state.pages.projects.loading,
  );

  const columns = React.useMemo(
    () =>
      isMobile()
        ? projectsMobileColumns(navigate, usersMap)
        : projectsDesktopColumns(navigate, usersMap, tableState),
    [navigate, usersMap, tableState],
  );
  return (
    <>
      <div className="projects_filters">
        {currentRole !== RoleId.USER && (
          <Space>
            <EditableProjectDialog />
          </Space>
        )}
      </div>
      <Table
        onChange={handleTableChange}
        dataSource={projectsData}
        columns={columns}
        loading={isLoading}
      />
    </>
  );
};
