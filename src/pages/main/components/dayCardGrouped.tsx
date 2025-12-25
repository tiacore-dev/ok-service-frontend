import * as React from "react";
import { Card, Typography } from "antd";
import Meta from "antd/es/card/Meta";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IProject } from "../../../interfaces/projects/IProject";
import { IUser } from "../../../interfaces/users/IUser";
import { groupDayByLeaderAndProject } from "./groupDayByLeaderAndProject";
import { LeaderStatusPie } from "./leaderStatusPie";

type DayPayload = [
  string,
  {
    notOpened?: IShiftReportsListColumn[];
    empty?: IShiftReportsListColumn[];
    signed?: IShiftReportsListColumn[];
    notSigned?: IShiftReportsListColumn[];
  },
];

type UsersMap = Record<string, IUser | undefined>;
type ProjectsMap = Record<string, IProject | undefined>;

// если у тебя объект называется иначе — поправь интерфейс
type ObjectsMap = Record<string, { name: string } | undefined>;

interface DayCardGroupedProps {
  data?: DayPayload;
  usersMap: UsersMap;
  projectsMap: ProjectsMap;
  objectsMap: ObjectsMap;
}

const statusMeta: Array<{
  key: "notOpened" | "empty" | "notSigned" | "signed";
  title: string;
  liClassName: string;
}> = [
  {
    key: "notOpened",
    title: "Не открыто",
    liClassName: "main__day__not-opened",
  },
  { key: "empty", title: "Не заполнено", liClassName: "main__day__empty" },
  {
    key: "notSigned",
    title: "Не согласовано",
    liClassName: "main__day__not-signed",
  },
  { key: "signed", title: "Согласовано", liClassName: "main__day__signed" },
];

export const DayCardGrouped: React.FC<DayCardGroupedProps> = ({
  data,
  usersMap,
  projectsMap,
  objectsMap,
}) => {
  const grouped = React.useMemo(() => {
    if (!data) return undefined;
    const [, stats] = data;
    return groupDayByLeaderAndProject(stats, projectsMap, usersMap);
  }, [data, projectsMap, usersMap]);

  if (!data) return null;
  const [date] = data;

  const leadersEntries = grouped ? Object.entries(grouped) : [];

  return (
    <Card>
      <Meta title={`Данные по сменам за ${date}`} />

      {!leadersEntries.length ? (
        <div style={{ marginTop: 12 }}>Нет данных</div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div className="leadersMasonry">
            {leadersEntries.map(([leaderId, leaderBucket]) => (
              <div key={leaderId} className="leadersMasonry__item">
                <Card size="small">
                  <Card size="small" style={{ height: "100%" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <LeaderStatusPie
                        leaderProjects={leaderBucket.projects}
                        size={30}
                      />
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {leaderBucket.leaderName}
                      </Typography.Title>
                    </div>

                    {Object.entries(leaderBucket.projects).map(
                      ([projectId, projectBucket]) => {
                        const objectName = projectBucket.object
                          ? objectsMap[projectBucket.object]?.name
                          : undefined;

                        return (
                          <div key={projectId} style={{ marginTop: 12 }}>
                            <Typography.Text strong>
                              {projectBucket.projectName}
                            </Typography.Text>

                            {objectName ? (
                              <Typography.Text type="secondary">
                                {" "}
                                — {objectName}
                              </Typography.Text>
                            ) : null}

                            <div className="main__day" style={{ marginTop: 8 }}>
                              {statusMeta.map(({ key, title, liClassName }) => {
                                const arr = projectBucket.statuses[key];
                                if (!arr?.length) return null;

                                return (
                                  <div className="main__day__el" key={key}>
                                    {title}: {arr.length}
                                    <ul className="main__day__ul-today">
                                      {arr.map((el) => (
                                        <li
                                          className={liClassName}
                                          key={el.key}
                                        >
                                          {usersMap[el.user]?.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </Card>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
