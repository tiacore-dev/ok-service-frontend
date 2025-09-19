import * as React from "react";
import { Card, Col, List, Row, Space } from "antd";
import Meta from "antd/es/card/Meta";
import { useSelector } from "react-redux";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import {
  CheckCircleFilled,
  CheckCircleTwoTone,
  ClockCircleFilled,
  PlusCircleFilled,
} from "@ant-design/icons";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";

export interface IUserStatsItem {
  user: string;
  status: "empty" | "not-signed" | "signed";
}

export interface IProjectStatsItem {
  project: string;
  users: IUserStatsItem[];
}

export interface IObjectStatsItem {
  object: string;
  done: boolean;
  projects: IProjectStatsItem[];
}

export interface IChartsByObjectsProps {
  totalCostArrayByObjects: IObjectStatsItem[];
  // description: string;
}

export const ChartsByObjects = (props: IChartsByObjectsProps) => {
  const {
    totalCostArrayByObjects,
    // description
  } = props;

  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const projectsMap = useSelector(getProjectsMap);

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

  return (
    <Row gutter={[16, 16]}>
      {totalCostArrayByObjects.map((element) => {
        const title = (
          <Space direction="horizontal">
            {objectsMap[element.object]?.name}
            {element.done && <CheckCircleTwoTone twoToneColor="#4090ff" />}
          </Space>
        );
        return (
          <Col key={element.object} xs={24} sm={12} md={8}>
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
          </Col>
        );
      })}
    </Row>
  );
};
