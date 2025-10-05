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
import { useCreateShiftReportMutation } from "../../hooks/QueryActions/shift-reports/shift-reports.mutations";
import "./assignment.less";
import { ObjectStatusId } from "../../interfaces/objectStatuses/IObjectStatus";

export const Assignment = () => {
  const date_from = React.useMemo(() => getToday().getTime(), []);
  const [date_to, setDateTo] = React.useState(new Date().getTime());

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

  const assignOptions = React.useMemo(() => {
    if (!projects || !objectsMap)
      return [] as { value: string; label: string }[];
    return projects
      .filter(
        (p) =>
          p.project_id &&
          objectsMap[p.object]?.status === ObjectStatusId.ACTIVE,
      )
      .filter((p) =>
        role === RoleId.PROJECT_LEADER ? p.project_leader === userId : true,
      )
      .map((p) => ({
        value: p.project_id!,
        label: `${objectsMap[p.object]?.name} — ${p.name}`,
      }));
  }, [projects, objectsMap, role, userId]);

  const userOptions = React.useMemo(() => {
    return userShiftData
      .filter((u) => !u.assignments.length)
      .map((u) => ({
        value: u.userId,
        label: usersMap[u.userId]?.name ?? u.userId,
      }));
  }, [userShiftData, usersMap]);

  const { mutate: createShift, isPending: isAssigning } =
    useCreateShiftReportMutation();

  const assignUserToProject = React.useCallback(
    (user_to_assign: string, projectId: string) => {
      const now = Date.now();
      createShift(
        {
          user: user_to_assign,
          project: projectId,
          date: now,
          signed: false,
          night_shift: false,
          extreme_conditions: false,
        },
        {
          onSuccess: () => {
            setDateTo(Date.now());
          },
        },
      );
    },
    [createShift],
  );

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
                userOptions={userOptions}
                onAssignUser={(projectId, userId) =>
                  assignUserToProject(userId, projectId)
                }
                assigning={isAssigning}
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
            assignOptions={assignOptions}
            onAssign={assignUserToProject}
            assigning={isAssigning}
          />
        </div>
      </div>
    </>
  );
};
