import * as React from "react";
import { Card, Col, List, Row, Space } from "antd";
import Meta from "antd/es/card/Meta";
import {
  CheckCircleFilled,
  CheckCircleTwoTone,
  ClockCircleFilled,
  PlusCircleFilled,
} from "@ant-design/icons";
import { useUsersMap } from "../../../queries/users";
import { useObjectsMap } from "../../../queries/objects";
import { useProjectsMap } from "../../../queries/projects";
import {
  IObjectStatsItem,
  IUserStatsItem,
} from "../../../interfaces/objects/IObjectStat";
import "./chartsByObjects.less";

export interface IChartsByObjectsProps {
  totalCostArrayByObjects: IObjectStatsItem[];
}

export const ChartsByObjects = (props: IChartsByObjectsProps) => {
  const { totalCostArrayByObjects } = props;

  const { objectsMap } = useObjectsMap();
  const { usersMap } = useUsersMap();
  const { projectsMap } = useProjectsMap();

  const renderItem = (item: IUserStatsItem) => {
    let avatar = null;

    switch (item.status) {
      case "empty":
        avatar = (
          <PlusCircleFilled className="charts-by-objects__status-icon charts-by-objects__status-icon--empty" />
        );
        break;
      case "not-signed":
        avatar = (
          <ClockCircleFilled className="charts-by-objects__status-icon charts-by-objects__status-icon--not-signed" />
        );
        break;
      case "signed":
        avatar = (
          <CheckCircleFilled className="charts-by-objects__status-icon charts-by-objects__status-icon--signed" />
        );
        break;

      default:
        return;
    }

    const userName = usersMap[item.user]?.name ?? item.user;

    return (
      <List.Item>
        <Space direction="horizontal" align="center">
          {avatar}
          <p className="charts-by-objects__user">{userName}</p>
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
            {element.done && <CheckCircleTwoTone twoToneColor="#6940ff" />}
          </Space>
        );
        return (
          <Col key={element.object} xs={24} sm={12} md={8}>
            <Card title={title} size="small">
              {element.projects.map((el) => (
                <div key={el.project}>
                  <Meta
                    description={`${projectsMap[el.project].name} (${usersMap[projectsMap[el.project].project_leader]?.name ?? projectsMap[el.project].project_leader})`}
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
