import { Col, Card, Row, Button, Space, Select } from "antd";
import * as React from "react";
import { Column, Line, Pie } from "@ant-design/charts";
import Meta from "antd/es/card/Meta";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { useDispatch, useSelector } from "react-redux";
import { getShiftReportsData } from "../../store/modules/pages/selectors/shift-reports.selector";
import {
  dateTimestampToLocalString,
  getLast21stDate,
  tenDaysAgo,
} from "../../utils/dateConverter";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useProjects } from "../../hooks/ApiActions/projects";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { IState } from "../../store/modules";
import { IShiftReportsList } from "../../interfaces/shiftReports/IShiftReportsList";
import { toggleFullScreenMode } from "../../store/modules/settings/general";
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";

const dateTenDaysAgo = tenDaysAgo();
const last21stDate = getLast21stDate();

export const Main = () => {
  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;
  const dispatch = useDispatch();

  const fullScreenMode = useSelector(
    (state: IState) => state.settings.generalSettings.fullScreenMode,
  );

  const { getShiftReports } = useShiftReports();
  const { getObjects } = useObjects();
  const { getProjects } = useProjects();
  const mobile = isMobile();

  React.useEffect(() => {
    if (isAuth) {
      getShiftReports();
      getObjects();
      getProjects();

      const interval = setInterval(
        () => {
          getShiftReports();
        },
        10 * 60 * 1000,
      );

      return () => clearInterval(interval);
    }
  }, []);

  const projectsMap = useSelector(getProjectsMap);
  const objectsMap = useSelector(getObjectsMap);
  const role = useSelector(getCurrentRole);
  const shiftReportsData = useSelector(getShiftReportsData);
  const [dateFilterMode, setDateFilterMode] = React.useState<
    "tenDaysAgo" | "fromLast21st"
  >(role === RoleId.USER ? "fromLast21st" : "tenDaysAgo");

  const filterDate = React.useMemo(
    () =>
      dateFilterMode === "fromLast21st"
        ? last21stDate
        : dateFilterMode === "tenDaysAgo"
          ? dateTenDaysAgo
          : undefined,
    [dateFilterMode],
  );

  const description = React.useMemo(
    () =>
      dateFilterMode === "fromLast21st"
        ? "с 21 числа"
        : dateFilterMode === "tenDaysAgo"
          ? "за последние 10 дней"
          : "",
    [dateFilterMode],
  );

  const filteredShiftReportsData = React.useMemo(
    () =>
      shiftReportsData
        .slice()
        .sort((a, b) => a.date - b.date)
        .filter((el) => el.date >= filterDate),
    [shiftReportsData, filterDate],
  );

  const totalCostData = React.useMemo(
    () =>
      filteredShiftReportsData.reduce((acc: Record<string, number>, val) => {
        const date = dateTimestampToLocalString(val.date);
        acc[date] = (acc[date] ?? 0) + val.shift_report_details_sum;
        return acc;
      }, {}),
    [filteredShiftReportsData],
  );

  const totalCostArray = React.useMemo(
    () =>
      Object.entries(totalCostData).map(([date, value]) => ({
        date,
        value,
      })),
    [totalCostData],
  );

  const totalCountData = React.useMemo(() => {
    const totalCostMap = filteredShiftReportsData.reduce(
      (acc: Record<string, IShiftReportsList[]>, val) => {
        const date = dateTimestampToLocalString(val.date);
        acc[date] = acc[date] ? [...acc[date], val] : [val];
        return acc;
      },
      {},
    );

    const result = Object.keys(totalCostMap).reduce(
      (acc: Record<string, number>, key: string) => {
        const users = Array.from(
          new Set(totalCostMap[key].map((el) => el.user)),
        );
        acc[key] = users?.length;
        return acc;
      },
      {},
    );

    return result;
  }, [filteredShiftReportsData]);

  const totalCountArray = React.useMemo(
    () =>
      Object.entries(totalCountData).map(([date, value]) => ({
        date,
        value,
      })),
    [totalCountData],
  );

  const averageCostArray = React.useMemo(
    () =>
      Object.entries(totalCostData).map(([date, value]) => ({
        date,
        value: Math.round(value / totalCountData[date]),
      })),
    [totalCostData, totalCountData],
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
        {},
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
    <div style={{ padding: "24px" }}>
      {!mobile && (
        <Space style={{ marginBottom: "12px" }} direction="horizontal">
          <Button
            icon={
              fullScreenMode ? (
                <FullscreenExitOutlined />
              ) : (
                <FullscreenOutlined />
              )
            }
            onClick={() => {
              dispatch(toggleFullScreenMode());
            }}
          ></Button>
          <Select
            value={dateFilterMode}
            onChange={setDateFilterMode}
            options={[
              { label: "Последние 10 дней", value: "tenDaysAgo" },
              { label: "с 21-ого числа", value: "fromLast21st" },
            ]}
          ></Select>
        </Space>
      )}

      <Row gutter={[16, 16]}>
        <Col key={0} xs={24} sm={12}>
          <Card hoverable>
            <Meta
              title="Общая стоимость выполненных работ"
              description={description}
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
              <Meta title="Количество смен" description={description} />
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
              <Meta title="Средняя стоимость смены" description={description} />
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
              description={description}
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
  );
};
