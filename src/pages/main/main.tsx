import { Button, Space, Select } from "antd";
import * as React from "react";
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
import { useUsers } from "../../hooks/ApiActions/users";
import { ChartsByUsers } from "./chartsByUsers";
import { Charts } from "./charts";

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
        <ChartsByUsers
          description={description}
          totalCostArrayByUser={totalCostArrayByUser}
        />
      ) : (
        <Charts
          description={description}
          totalCostArray={totalCostArray}
          totalCountArray={totalCountArray}
          averageCostArray={averageCostArray}
          clientData={clientData}
        />
      )}
    </div>
  );
};
