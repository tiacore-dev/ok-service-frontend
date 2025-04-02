import { Col, Card, Row, Button, Space, Select } from "antd";
import * as React from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { useUsers } from "../../hooks/ApiActions/users";

const dateTenDaysAgo = tenDaysAgo();
const last21stDate = getLast21stDate();

export const Main = () => {
  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;
  const dispatch = useDispatch();
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  const fullScreenMode = useSelector(
    (state: IState) => state.settings.generalSettings.fullScreenMode,
  );

  const usersMap = useSelector(getUsersMap);
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const { getShiftReports } = useShiftReports();
  const { getObjects } = useObjects();
  const { getProjects } = useProjects();
  const { getUsers } = useUsers();
  const mobile = isMobile();

  React.useEffect(() => {
    if (isAuth) {
      getShiftReports();
      getObjects();
      getProjects();
      getUsers();
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

  const [showMode, setShowMode] = React.useState<"all" | "byUsers">("all");

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

  const totalCostDataByUser = React.useMemo(
    () =>
      filteredShiftReportsData.reduce(
        (acc: Record<string, Record<string, number>>, val) => {
          const user = val.user;

          const date = dateTimestampToLocalString(val.date);

          const userData = acc[user];

          if (userData) {
            const newSum = (userData[date] ?? 0) + val.shift_report_details_sum;
            acc[user] = { ...userData, [date]: newSum };
          } else {
            acc[user] = { [date]: val.shift_report_details_sum };
          }

          return acc;
        },
        {},
      ),
    [filteredShiftReportsData],
  );

  const totalCostArrayByUser = React.useMemo(
    () =>
      Object.entries(totalCostDataByUser).map(([user, value]) => ({
        user,
        data: Object.entries(value).map(([date, value]) => ({
          date,
          value,
        })),
      })),
    [totalCostData],
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

      const result = Object.entries(dataWithObject).map(([name, value]) => ({
        name,
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

          <Select
            value={showMode}
            onChange={setShowMode}
            options={[
              { label: "По типу данных", value: "all" },
              { label: "По сотрудникам", value: "byUsers" },
            ]}
          ></Select>
        </Space>
      )}

      {showMode === "byUsers" ? (
        <Row gutter={[16, 16]}>
          {totalCostArrayByUser.map((element) => (
            <Col ref={containerRef} key={0} xs={24} sm={12}>
              <Card hoverable style={{ padding: "0 24px" }}>
                <Meta
                  title={usersMap[element.user]?.name}
                  description={description}
                />
                <BarChart
                  width={width - 84}
                  height={400}
                  data={element.data}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 0,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis tick={{ fill: "black" }} dataKey="date" />
                  <YAxis tick={{ fill: "black" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4090ff" name="Сумма" />
                </BarChart>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col ref={containerRef} key={0} xs={24} sm={12}>
            <Card hoverable style={{ padding: "0 24px" }}>
              <Meta
                title="Общая стоимость выполненных работ"
                description={description}
              />
              <BarChart
                width={width - 84}
                height={400}
                data={totalCostArray}
                margin={{
                  top: 30,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis tick={{ fill: "black" }} dataKey="date" />
                <YAxis tick={{ fill: "black" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4090ff" name="Сумма" />
              </BarChart>
            </Card>
          </Col>

          {role !== RoleId.USER && (
            <Col key={1} xs={24} sm={12}>
              <Card hoverable>
                <Meta title="Количество смен" description={description} />
                <BarChart
                  width={width - 84}
                  height={400}
                  data={totalCountArray}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 0,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis tick={{ fill: "black" }} dataKey="date" />
                  <YAxis tick={{ fill: "black" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4090ff" name="Количество смен" />
                </BarChart>
              </Card>
            </Col>
          )}

          {role !== RoleId.USER && (
            <Col key={2} xs={24} sm={12}>
              <Card hoverable>
                <Meta
                  title="Средняя стоимость смены"
                  description={description}
                />
                <LineChart
                  width={width - 84}
                  height={400}
                  data={averageCostArray}
                >
                  <XAxis tick={{ fill: "black" }} dataKey="name" />
                  <YAxis tick={{ fill: "black" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    name="Средняя стоимость"
                    type="monotone"
                    dataKey="value"
                    stroke="#4090ff"
                    strokeWidth={2}
                  />
                </LineChart>
              </Card>
            </Col>
          )}

          <Col key={3} xs={24} sm={12}>
            <Card hoverable>
              <Meta
                title={"Cтоимость выполненных работ по объектам"}
                description={description}
              />
              <PieChart width={width - 84} height={400}>
                <Pie
                  data={clientData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#4090ff"
                  label
                />
                <Tooltip />
              </PieChart>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
