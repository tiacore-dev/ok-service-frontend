import React from "react";
import { Card, List, Space, Button, Popover, Select } from "antd";
import { StatusIcon, ShiftStatus } from "./statusIcon";
import { StopOutlined } from "@ant-design/icons";

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
  assignOptions?: { value: string; label: string }[];
  onAssign?: (userId: string, projectId: string) => void;
  assigning?: boolean;
}

export const UsersAssignmentsCard: React.FC<Props> = ({
  data,
  objectsMap,
  projectsMap,
  usersMap,
  loading,
  assignOptions = [],
  onAssign,
  assigning = false,
}) => {
  const [openUser, setOpenUser] = React.useState<string | null>(null);
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
                  <Space direction="horizontal" align="center">
                    <StopOutlined style={{ fontSize: 20, color: "#4090ff" }} />
                    <span className="assignment-page__unassigned">
                      Не назначен
                    </span>
                    <Popover
                      trigger="click"
                      open={openUser === item.userId}
                      onOpenChange={(o) => {
                        if (assigning) {
                          return;
                        }
                        setOpenUser(o ? item.userId : null);
                      }}
                      content={
                        <Select
                          showSearch
                          placeholder="Выбрать объект и спецификацию"
                          style={{ minWidth: 420 }}
                          options={assignOptions}
                          loading={assigning}
                          disabled={assigning}
                          filterOption={(input, option) =>
                            (option?.label as string)
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(projectId) => {
                            onAssign?.(item.userId, projectId as string);
                            setOpenUser(null);
                          }}
                        />
                      }
                    >
                      <Button
                        type="default"
                        loading={assigning}
                        disabled={assigning}
                      >
                        Назначить
                      </Button>
                    </Popover>
                  </Space>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};
