import { Breadcrumb, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getProjectsMap,
  getProjectsState,
} from "../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import {
  getUsersMap,
  getUsersState,
} from "../../store/modules/pages/selectors/users.selector";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { getToday } from "../../utils/dateConverter";
import { RoleId } from "../../interfaces/roles/IRole";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useProjects } from "../../hooks/ApiActions/projects";
import { useUsers } from "../../hooks/ApiActions/users";
import { IState } from "../../store/modules";
import { useShiftReportsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import { IShiftReportQueryParams } from "../../interfaces/shiftReports/IShiftReport";
import { ObjectProjectsCard } from "./components/objectProjectsCard";
import { UsersAssignmentsCard } from "./components/usersAssignmentsCard";
import { useAssignmentData } from "./hooks/useAssignmentData";
import "./assignment.less";

export const Assignment = () => {
  const date_from = React.useMemo(() => getToday().getTime(), []);
  const date_to = React.useMemo(() => new Date().getTime(), []);

  const projectsMap = useSelector(getProjectsMap);
  const { data: projects } = useSelector(getProjectsState);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const { data: users } = useSelector(getUsersState);
  const role = useSelector(getCurrentRole);
  const userId = useSelector(getCurrentUserId);

  const queryParams: IShiftReportQueryParams = {
    sort_by: "date",
    sort_order: "desc",
    date_from,
    date_to,
  };

  const { data: shiftReportsData, isLoading } =
    useShiftReportsQuery(queryParams);

  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;

  const { getObjects } = useObjects();
  const { getProjects } = useProjects();
  const { getUsers } = useUsers();

  React.useEffect(() => {
    if (isAuth) {
      getObjects();
      getProjects();
      getUsers();
    }
  }, [isAuth]);

  const filteredShiftReportsData = React.useMemo(
    () =>
      (shiftReportsData?.shift_reports || [])
        .slice()
        .sort((a, b) => a.date - b.date)
        .filter(
          (el) =>
            el.date >= date_from &&
            el.date <= date_to &&
            (role === RoleId.ADMIN ||
              role === RoleId.MANAGER ||
              (role === RoleId.PROJECT_LEADER &&
                projectsMap[el.project] &&
                projectsMap[el.project].project_leader === userId)),
        ),
    [shiftReportsData, date_from, date_to, role, projectsMap, userId],
  );
  const { objectsShiftData, userShiftData } = useAssignmentData({
    filteredShiftReportsData,
    projects,
    projectsMap,
    objectsMap,
    users,
    usersMap,
    role,
    userId,
  });

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() ? { backgroundColor: "#F8F8F8" } : undefined}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/shifts">Смены</Link> },
          {
            title: `Распределение смен`,
          },
        ]}
      />

      <div className="assignment-page__layout">
        <div className="assignment-page__column">
          <Space direction="vertical" className="assignment-page__fullWidth">
            {objectsShiftData.map((element) => (
              <ObjectProjectsCard
                key={element.object}
                objectId={element.object}
                projects={element.projects}
                objectsMap={objectsMap}
                projectsMap={projectsMap}
                usersMap={usersMap}
                loading={isLoading}
              />
            ))}
          </Space>
        </div>

        <div className="assignment-page__column">
          <UsersAssignmentsCard
            data={userShiftData}
            objectsMap={objectsMap}
            projectsMap={projectsMap}
            usersMap={usersMap}
            loading={isLoading}
          />
        </div>
      </div>
    </>
  );
};
