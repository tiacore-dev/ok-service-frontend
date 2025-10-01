import React from "react";
import { Card, List, Space } from "antd";
import { StatusIcon, ShiftStatus } from "./statusIcon";

type ObjectsMap = Record<string, { name: string }>;
type ProjectsMap = Record<string, { name: string }>;
type UsersMap = Record<string, { name: string }>;

export interface IUserShiftAssignmentUI {
  userId: string;
  assignments: { objectId: string; projectId: string; status: ShiftStatus }[];
}

interface Props {
  data: IUserShiftAssignmentUI[];
  objectsMap: ObjectsMap;
  projectsMap: ProjectsMap;
  usersMap: UsersMap;
  loading?: boolean;
}

export const UsersAssignmentsCard: React.FC<Props> = ({
  data,
  objectsMap,
  projectsMap,
  usersMap,
  loading,
}) => {
  return (
    <Card size="small">
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={data}
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
                      const objectName = objectsMap[assignment.objectId]?.name;
                      const projectName =
                        projectsMap[assignment.projectId]?.name;
                      return (
                        <List.Item>
                          <Space
                            direction="horizontal"
                            align="center"
                            className="assignment-page__statusItem"
                          >
                            <StatusIcon status={assignment.status} />
                            {objectName} — {projectName}
                          </Space>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <span className="assignment-page__unassigned">
                    Не назначен
                  </span>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};
