import { Layout, Breadcrumb, Col, Card, Row } from "antd";
import * as React from "react";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { Column, Line, Pie } from "@ant-design/charts";
import Meta from "antd/es/card/Meta";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { useSelector } from "react-redux";
import { getShiftReportsData } from "../../store/modules/pages/selectors/shift-reports.selector";
import {
  dateTimestampToLocalString,
  tenDaysAgo,
} from "../../utils/dateConverter";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useProjects } from "../../hooks/ApiActions/projects";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { IState } from "../../store/modules";

const filterDate = tenDaysAgo();

export const Main = () => {
  const { Content } = Layout;

  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;

  const { getShiftReports } = useShiftReports();
  const { getObjects } = useObjects();
  const { getProjects } = useProjects();

  React.useEffect(() => {
    if (isAuth) {
      getShiftReports();
      getObjects();
      getProjects();

      const interval = setInterval(
        () => {
          getShiftReports();
        },
        10 * 60 * 1000
      );

      return () => clearInterval(interval);
    }
  }, []);

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const role = useSelector(getCurrentRole);
  const shiftReportsData = useSelector(getShiftReportsData);

  const filteredShiftReportsData = React.useMemo(
    () =>
      shiftReportsData
        .slice()
        .sort((a, b) => a.date - b.date)
        .filter((el) => el.date >= filterDate),
    [shiftReportsData]
  );

  const totalCostData = React.useMemo(
    () =>
      filteredShiftReportsData.reduce((acc: Record<string, number>, val) => {
        const date = dateTimestampToLocalString(val.date);
        acc[date] = (acc[date] ?? 0) + val.shift_report_details_sum;
        return acc;
      }, {}),
    [filteredShiftReportsData]
  );

  const totalCostArray = React.useMemo(
    () =>
      Object.entries(totalCostData).map(([date, value]) => ({
        date,
        value,
      })),
    [totalCostData]
  );

  const totalCountData = React.useMemo(
    () =>
      filteredShiftReportsData.reduce((acc: Record<string, number>, val) => {
        const date = dateTimestampToLocalString(val.date);
        acc[date] = (acc[date] ?? 0) + 1;
        return acc;
      }, {}),
    [filteredShiftReportsData]
  );

  const totalCountArray = React.useMemo(
    () =>
      Object.entries(totalCountData).map(([date, value]) => ({
        date,
        value,
      })),
    [totalCountData]
  );

  const averageCostArray = React.useMemo(
    () =>
      Object.entries(totalCostData).map(([date, value]) => ({
        date,
        value: Math.round(value / totalCountData[date]),
      })),
    [totalCostData, totalCountData]
  );

  const clientData = React.useMemo(() => {
    if (projectsMap && objectsMap) {
      const reportsWithObject = filteredShiftReportsData.map((el) => {
        const object = objectsMap[projectsMap[el.project]?.object]?.name;
        return { ...el, object };
      });

      const dataWithObject = reportsWithObject.reduce(
        (acc: Record<string, number>, val) => {
          acc[val.object] =
            (acc[val.object] ?? 0) + val.shift_report_details_sum;
          return acc;
        },
        {}
      );

      const result = Object.entries(dataWithObject).map(([client, value]) => ({
        client,
        value,
      }));

      return result;
    } else {
      return [];
    }
  }, [filteredShiftReportsData, projectsMap, objectsMap]);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[{ title: "Главная" }]}
      />
      <Content
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <div style={{ padding: "24px" }}>
          <Row gutter={[16, 16]}>
            <Col key={0} xs={24} sm={12}>
              <Card hoverable>
                <Meta
                  title="Общая стоимость выполненных работ"
                  description="за последние 10 дней"
                />
                <Column
                  height={400}
                  data={totalCostArray}
                  xField="date"
                  yField="value"
                  color="#1f78b4"
                  tooltip={false}
                  label={{
                    text: (originData: { date: string; value: number }) =>
                      originData.value,
                    style: {
                      fill: "#FFFFFF",
                      fontSize: 12,
                    },
                    position: "top",
                  }}
                />
              </Card>
            </Col>

            {role !== RoleId.USER && (
              <Col key={1} xs={24} sm={12}>
                <Card hoverable>
                  <Meta
                    title="Количество смен"
                    description="за последние 10 дней"
                  />
                  <Column
                    height={400}
                    data={totalCountArray}
                    xField="date"
                    yField="value"
                    color="#1f78b4"
                    tooltip={false}
                    label={{
                      text: (originData: { date: string; value: number }) =>
                        originData.value,
                      style: {
                        fill: "#FFFFFF",
                        fontSize: 12,
                      },
                      position: "top",
                    }}
                  />
                </Card>
              </Col>
            )}

            {role !== RoleId.USER && (
              <Col key={2} xs={24} sm={12}>
                <Card hoverable>
                  <Meta
                    title="Средняя стоимость смены"
                    description="за последние 10 дней"
                  />
                  <Line
                    height={400}
                    data={averageCostArray}
                    xField="date"
                    yField="value"
                    color="#1f78b4"
                    tooltip={false}
                  />
                </Card>
              </Col>
            )}

            <Col key={3} xs={24} sm={12}>
              <Card hoverable>
                <Meta
                  title={"Cтоимость выполненных работ по объектам"}
                  description={"за последние 10 дней"}
                />
                <Pie
                  height={400}
                  data={clientData}
                  angleField={"value"}
                  colorField={"client"}
                  radius={0.8}
                  tooltip={false}
                  label={{
                    text: (originData: { date: string; value: number }) =>
                      originData.value,
                    style: {
                      fill: "#FFFFFF",
                      fontSize: 12,
                    },
                    position: "top",
                  }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </>
  );
};
