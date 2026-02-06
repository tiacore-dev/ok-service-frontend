import React from "react";
import { Card, List, Space, Button, Popover, Select } from "antd";
import Meta from "antd/es/card/Meta";
import { IProjectStatsItem } from "../../../interfaces/objects/IObjectStat";
import { StatusIcon } from "./statusIcon";
import "./objectProjectsCard.less";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";

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
  userOptions?: { value: string; label: string }[];
  onAssignUser?: (projectId: string, userId: string) => void;
  assigning?: boolean;
}

export const ObjectProjectsCard: React.FC<Props> = ({
  objectId,
  projects,
  objectsMap,
  projectsMap,
  usersMap,
  loading,
  userOptions = [],
  onAssignUser,
  assigning = false,
}) => {
  const [openProject, setOpenProject] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(true);

  const title = (
    <div className="object-projects__title">
      <button
        type="button"
        className="object-projects__toggle"
        aria-label={isExpanded ? "Свернуть объект" : "Развернуть объект"}
        onClick={() =>
          setIsExpanded((prev) => {
            if (prev) {
              setOpenProject(null);
            }
            return !prev;
          })
        }
      >
        {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </button>
      <span>{objectsMap[objectId]?.name}</span>
    </div>
  );

  return (
    <Card key={objectId} title={title} size="small" className="object-projects__card">
      {isExpanded && (
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
                <Space direction="vertical">
                  <Space
                    direction="horizontal"
                    align="center"
                    className="assignment-page__assignRow"
                  >
                    <Popover
                      trigger="click"
                      open={openProject === el.project}
                      onOpenChange={(o) => {
                        if (assigning) {
                          return;
                        }
                        setOpenProject(o ? el.project : null);
                      }}
                      content={
                        <Select
                          showSearch
                          placeholder="Выбрать сотрудника"
                          className="object-projects__assign-select"
                          options={userOptions}
                          loading={assigning}
                          disabled={assigning}
                          filterOption={(input, option) =>
                            (option?.label as string)
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(userId) => {
                            onAssignUser?.(el.project, userId as string);
                            setOpenProject(null);
                          }}
                        />
                      }
                    >
                      <Button
                        type="default"
                        loading={assigning}
                        disabled={assigning}
                      >
                        Добавить сотрудника
                      </Button>
                    </Popover>
                  </Space>
                  {el.users.map((user) => (
                    <Space
                      key={`${el.project}-${user.user}`}
                      direction="horizontal"
                      align="center"
                      className="assignment-page__statusItem"
                    >
                      <StatusIcon status={user.status} />
                      <p className="object-projects__user">
                        {usersMap[user.user]?.name ?? user.user}
                      </p>
                    </Space>
                  ))}
                </Space>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};
