import { Breadcrumb, Card, List, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import {
  IProjectStatsItem,
  IUserStatsItem,
} from "../../interfaces/objects/IObjectStat";
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
import {
  CheckCircleFilled,
  ClockCircleFilled,
  PlusCircleFilled,
  StopOutlined,
} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { getToday } from "../../utils/dateConverter";
import { RoleId } from "../../interfaces/roles/IRole";
import { ObjectStatusId } from "../../interfaces/objectStatuses/IObjectStatus";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useProjects } from "../../hooks/ApiActions/projects";
import { useUsers } from "../../hooks/ApiActions/users";
import { IState } from "../../store/modules";
import { useShiftReportsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import { IShiftReportQueryParams } from "../../interfaces/shiftReports/IShiftReport";

interface IShiftAssignment {
  objectId: string;
  projectId: string;
  status: "signed" | "empty" | "not-signed";
}

interface IUserShiftAssignment {
  userId: string;
  assignments: IShiftAssignment[];
}

const iconByStatus = (status: "empty" | "not-signed" | "signed") => {
  let icon = null;
  switch (status) {
    case "empty":
      icon = <PlusCircleFilled style={{ fontSize: 20, color: "#ffd940" }} />;
      break;
    case "not-signed":
      icon = <ClockCircleFilled style={{ fontSize: 20, color: "#2bba23" }} />;
      break;
    case "signed":
      icon = <CheckCircleFilled style={{ fontSize: 20, color: "#4090ff" }} />;
      break;

    default:
      return icon;
  }

  return icon;
};

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

  const objectsShiftData = React.useMemo(() => {
    if (!projectsMap || !objectsMap) {
      return [];
    }

    const relevantProjects = (projects || []).filter((project) => {
      if (!project.project_id) {
        return false;
      }

      const object = objectsMap[project.object];

      if (!object || object.status !== ObjectStatusId.ACTIVE) {
        return false;
      }

      if (role === RoleId.PROJECT_LEADER) {
        return project.project_leader === userId;
      }

      return true;
    });

    if (!relevantProjects.length) {
      return [];
    }

    const objectProjectsMap: Record<string, IProjectStatsItem[]> = {};
    const projectEntriesMap: Record<string, IProjectStatsItem> = {};

    relevantProjects.forEach((project) => {
      const projectId = project.project_id;
      if (!projectId) {
        return;
      }

      const projectStats: IProjectStatsItem = {
        project: projectId,
        users: [],
      };

      if (!objectProjectsMap[project.object]) {
        objectProjectsMap[project.object] = [];
      }

      objectProjectsMap[project.object].push(projectStats);
      projectEntriesMap[projectId] = projectStats;
    });

    filteredShiftReportsData.forEach((report) => {
      const projectStats = projectEntriesMap[report.project];
      if (!projectStats) {
        return;
      }

      const status: IUserStatsItem["status"] =
        report.shift_report_details_sum === 0
          ? "empty"
          : report.signed
            ? "signed"
            : "not-signed";

      projectStats.users.push({
        user: report.user,
        status,
      });
    });

    return Object.entries(objectProjectsMap).map(([objectId, projectStats]) => {
      return {
        object: objectId,
        projects: projectStats,
      };
    });
  }, [
    filteredShiftReportsData,
    projects,
    projectsMap,
    objectsMap,
    role,
    userId,
  ]);

  const userShiftData = React.useMemo<IUserShiftAssignment[]>(() => {
    if (!users || !usersMap || !projectsMap || !objectsMap) {
      return [];
    }

    return users
      .filter((user) => user.role === RoleId.USER)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((user) => {
        const assignmentsMap: Record<string, IShiftAssignment> = {};

        filteredShiftReportsData.forEach((report) => {
          if (report.user !== user.user_id) {
            return;
          }

          const project = projectsMap[report.project];
          if (!project || !project.project_id) {
            return;
          }

          const object = objectsMap[project.object];
          if (
            !object ||
            object.status !== ObjectStatusId.ACTIVE ||
            !object.object_id
          ) {
            return;
          }

          const status: IShiftAssignment["status"] =
            report.shift_report_details_sum === 0
              ? "empty"
              : report.signed
                ? "signed"
                : "not-signed";

          const key = `${object.object_id}-${project.project_id}`;
          assignmentsMap[key] = {
            objectId: object.object_id,
            projectId: project.project_id,
            status,
          };
        });

        return {
          userId: user.user_id,
          assignments: Object.values(assignmentsMap),
        };
      });
  }, [filteredShiftReportsData, users, usersMap, projectsMap, objectsMap]);

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

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: isMobile() ? "wrap" : "nowrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 320 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            {objectsShiftData.map((element) => {
              const title = (
                <Space direction="horizontal">
                  {objectsMap[element.object]?.name}
                </Space>
              );
              return (
                <Card key={element.object} title={title} size="small">
                  <List
                    loading={isLoading}
                    itemLayout="vertical"
                    dataSource={element.projects}
                    renderItem={(el) => {
                      const projectInfo = projectsMap[el.project];
                      const leaderName = projectInfo
                        ? usersMap[projectInfo.project_leader]?.name
                        : undefined;
                      const description = projectInfo
                        ? `${projectInfo.name}${leaderName ? ` (${leaderName})` : ""}`
                        : "";

                      return (
                        <List.Item key={el.project}>
                          <Meta description={description} />
                          {el.users.map((user) => (
                            <Space
                              direction="horizontal"
                              align="center"
                              style={{ marginTop: "12px", marginRight: "12px" }}
                            >
                              {iconByStatus(user.status)}
                              <p style={{ margin: "0 0 3px 0" }}>
                                {usersMap[user.user]?.name ?? user.user}
                              </p>
                            </Space>
                          ))}
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              );
            })}
          </Space>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <Card size="small">
            <List
              loading={isLoading}
              itemLayout="vertical"
              dataSource={userShiftData}
              renderItem={(item) => {
                const userName = usersMap[item.userId]?.name ?? item.userId;
                return (
                  <List.Item>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <strong>{userName}</strong>
                      {item.assignments.length ? (
                        <List
                          size="small"
                          dataSource={item.assignments}
                          renderItem={(assignment) => {
                            const objectName =
                              objectsMap[assignment.objectId]?.name;
                            const projectName =
                              projectsMap[assignment.projectId]?.name;
                            return (
                              <List.Item>
                                <Space
                                  direction="horizontal"
                                  align="center"
                                  style={{
                                    marginTop: "12px",
                                    marginRight: "12px",
                                  }}
                                >
                                  {iconByStatus(assignment.status)}
                                  {objectName} — {projectName}
                                </Space>
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <Space
                          direction="horizontal"
                          align="center"
                          style={{ marginLeft: "16px" }}
                        >
                          <StopOutlined
                            style={{ fontSize: 20, color: "#4090ff" }}
                          />
                          <p style={{ margin: "0 0 3px 0" }}>Не назначен</p>
                        </Space>
                      )}
                    </Space>
                  </List.Item>
                );
              }}
            />
          </Card>
        </div>
      </div>
    </>
  );
};
