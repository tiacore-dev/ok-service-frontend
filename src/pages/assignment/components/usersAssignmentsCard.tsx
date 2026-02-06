import React from "react";
import { Card, List, Space, Button, Popover, Select } from "antd";
import { StatusIcon } from "./statusIcon";
import {
  ContactsOutlined,
  FrownOutlined,
  SmileOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { IUserShiftAssignment } from "../hooks/useAssignmentData";
import { leaveReasonesMap } from "../../../queries/leaveReasons";
import { LeaveReasonId } from "../../../interfaces/leaveReasones/ILeaveReason";
import "./usersAssignmentsCard.less";

type ObjectsMap = Record<string, { name: string }>;
type ProjectsMap = Record<string, { name: string }>;
type UsersMap = Record<string, { name: string }>;


interface Props {
  data: IUserShiftAssignment[];
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
              <Space direction="vertical" className="users-assignments__full">
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
                ) : item.leaveReason ? (
                  <Space direction="horizontal" align="center">
                    {item.leaveReason === LeaveReasonId.SICK_LEAVE && (
                      <FrownOutlined
                        className="users-assignments__leave-icon"
                      />
                    )}
                    {item.leaveReason === LeaveReasonId.VACATION && (
                      <ContactsOutlined
                        className="users-assignments__leave-icon"
                      />
                    )}
                    {item.leaveReason === LeaveReasonId.DAY_OFF && (
                      <SmileOutlined
                        className="users-assignments__leave-icon"
                      />
                    )}

                    <span className="assignment-page__unassigned">
                      {leaveReasonesMap[item.leaveReason].name}
                    </span>
                  </Space>
                ) : (
                  <Space direction="horizontal" align="center">
                    <StopOutlined className="users-assignments__stop-icon" />
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
                          className="users-assignments__assign-select"
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
