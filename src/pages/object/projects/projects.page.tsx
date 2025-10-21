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
import { isMobile } from "../../../utils/isMobile";
import { useUsersMap } from "../../../queries/users";
import { useProjectsMap } from "../../../queries/projects";

export const Projects = ({ object_id }: { object_id: string }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentRole = useSelector(getCurrentRole);

  const tableState = useSelector(
    (state: IState) => state.settings.projectsSettings
  );

  const handleTableChange = React.useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<IProjectsListColumn>
    ) => {
      const currentState = { pagination, filters, sorter };
      dispatch(saveProjectsTableState(currentState));
    },
    []
  );

  const { projects, isPending, isFetching } = useProjectsMap();
  const projectsData = React.useMemo(
    () =>
      (projects ?? [])
        .filter((doc) => doc.object === object_id)
        .map((doc) => ({ ...doc, key: doc.project_id })),
    [projects, object_id]
  );

  const { usersMap } = useUsersMap();

  const isLoading = isPending || isFetching;

  const columns = React.useMemo(
    () =>
      isMobile()
        ? projectsMobileColumns(navigate, usersMap)
        : projectsDesktopColumns(navigate, usersMap, tableState),
    [navigate, usersMap, tableState]
  );
  return (
    <>
      <div className="projects_filters">
        {currentRole !== RoleId.USER && (
          <Space>
            <EditableProjectDialog objectId={object_id} />
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
