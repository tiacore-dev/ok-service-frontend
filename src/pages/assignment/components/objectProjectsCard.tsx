import React from "react";
import { Card, List, Space } from "antd";
import Meta from "antd/es/card/Meta";
import { IProjectStatsItem } from "../../../interfaces/objects/IObjectStat";
import { StatusIcon } from "./statusIcon";

type ObjectsMap = Record<string, { name: string }>;
type ProjectsMap = Record<string, { name: string; project_leader: string }>;
type UsersMap = Record<string, { name: string }>;

interface Props {
  objectId: string;
  projects: IProjectStatsItem[];
  objectsMap: ObjectsMap;
  projectsMap: ProjectsMap;
  usersMap: UsersMap;
  loading?: boolean;
}

export const ObjectProjectsCard: React.FC<Props> = ({
  objectId,
  projects,
  objectsMap,
  projectsMap,
  usersMap,
  loading,
}) => {
  const title = (
    <Space direction="horizontal">{objectsMap[objectId]?.name}</Space>
  );

  return (
    <Card key={objectId} title={title} size="small">
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={projects}
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
                  key={`${el.project}-${user.user}`}
                  direction="horizontal"
                  align="center"
                  className="assignment-page__statusItem"
                >
                  <StatusIcon status={user.status} />
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
};
