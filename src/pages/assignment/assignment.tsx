import { Breadcrumb, Card, List, Space } from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import {
  IObjectStatsItem,
  IUserStatsItem,
} from "../../interfaces/objects/IObjectStat";
import { useSelector } from "react-redux";
import {
  getProjectsMap,
  // getProjectsState,
} from "../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { getShiftReportsData } from "../../store/modules/pages/selectors/shift-reports.selector";
import {
  CheckCircleFilled,
  CheckCircleTwoTone,
  ClockCircleFilled,
  PlusCircleFilled,
} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { getToday } from "../../utils/dateConverter";
import { RoleId } from "../../interfaces/roles/IRole";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useProjects } from "../../hooks/ApiActions/projects";
import { useUsers } from "../../hooks/ApiActions/users";
import { IState } from "../../store/modules";

export const Assignment = () => {
  const projectsMap = useSelector(getProjectsMap);
  // const { data: projects } = useSelector(getProjectsState);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const role = useSelector(getCurrentRole);
  const userId = useSelector(getCurrentUserId);
  const shiftReportsData = useSelector(getShiftReportsData);

  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;

  const { getShiftReports } = useShiftReports();
  const { getObjects } = useObjects();
  const { getProjects } = useProjects();
  const { getUsers } = useUsers();

  React.useEffect(() => {
    if (isAuth) {
      getShiftReports();
      getObjects();
      getProjects();
      getUsers();
      const interval = setInterval(
        () => {
          getShiftReports();
        },
        10 * 60 * 1000,
      );

      return () => clearInterval(interval);
    }
  }, []);

  const from = getToday().getTime();
  const to = new Date().getTime();

  const filteredShiftReportsData = React.useMemo(
    () =>
      shiftReportsData
        .slice()
        .sort((a, b) => a.date - b.date)
        .filter(
          (el) =>
            el.date >= from &&
            el.date <= to &&
            (role === RoleId.ADMIN ||
              role === RoleId.MANAGER ||
              (role === RoleId.PROJECT_LEADER &&
                projectsMap[el.project] &&
                projectsMap[el.project].project_leader === userId)),
        ),
    [shiftReportsData, from, to],
  );

  const renderItem = (item: IUserStatsItem) => {
    let avatar = null;

    switch (item.status) {
      case "empty":
        avatar = (
          <PlusCircleFilled style={{ fontSize: 20, color: "#ffd940" }} />
        );
        break;
      case "not-signed":
        avatar = (
          <ClockCircleFilled style={{ fontSize: 20, color: "#2bba23" }} />
        );
        break;
      case "signed":
        avatar = (
          <CheckCircleFilled style={{ fontSize: 20, color: "#4090ff" }} />
        );
        break;

      default:
        return;
    }

    return (
      <List.Item>
        <Space direction="horizontal" align="center">
          {avatar}
          <p style={{ margin: "0 0 3px 0" }}>{usersMap[item.user].name}</p>
        </Space>
      </List.Item>
    );
  };

  const objectsShiftData = React.useMemo(() => {
    if (projectsMap) {
      const reportsWithObject = filteredShiftReportsData.map((el) => {
        const object = projectsMap[el.project]?.object;
        return { ...el, object };
      });

      const dataWithObject = reportsWithObject.reduce(
        (acc: Record<string, Record<string, IUserStatsItem[]>>, val) => {
          const record: IUserStatsItem = {
            user: val.user,
            status:
              val.shift_report_details_sum === 0
                ? "empty"
                : val.signed
                  ? "signed"
                  : "not-signed",
          };

          acc = {
            ...acc,

            [val.object]: {
              ...acc[val.object],
              [val.project]: [
                ...(acc[val.object] ? acc[val.object][val.project] || [] : []),
                record,
              ],
            },
          };
          return acc;
        },
        {},
      );

      const result: IObjectStatsItem[] = Object.entries(dataWithObject).map(
        ([object, projectsData]) => {
          const projects = Object.entries(projectsData).map(
            ([project, users]) => ({
              project,
              users,
            }),
          );

          const result: IObjectStatsItem = {
            object,
            done:
              projects.length &&
              projects.every((project) =>
                project.users.every((user) => user.status === "signed"),
              ),
            projects,
          };

          return result;
        },
      );

      return result;
    } else {
      return [];
    }
  }, [filteredShiftReportsData, projectsMap, objectsMap]);

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

      <Space direction="vertical">
        {objectsShiftData.map((element) => {
          const title = (
            <Space direction="horizontal">
              {objectsMap[element.object]?.name}
              {element.done && <CheckCircleTwoTone twoToneColor="#4090ff" />}
            </Space>
          );
          return (
            <Card title={title} size="small">
              {element.projects.map((el) => (
                <div key={el.project}>
                  <Meta
                    description={`${projectsMap[el.project].name} (${usersMap[projectsMap[el.project].project_leader].name})`}
                  />
                  <List
                    itemLayout="horizontal"
                    dataSource={el.users}
                    renderItem={renderItem}
                  />
                </div>
              ))}
            </Card>
          );
        })}
      </Space>
    </>
  );
};
