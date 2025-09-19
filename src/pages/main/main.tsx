import { Button, Space, Select, DatePicker } from "antd";
import * as React from "react";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { useDispatch, useSelector } from "react-redux";
import { getShiftReportsData } from "../../store/modules/pages/selectors/shift-reports.selector";
import {
  dateFormat,
  dateTimestampToLocalString,
  getLast21stDate,
  getTenDaysAgo,
  getToday,
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
import {
  ChartsByObjects,
  IObjectStatsItem,
  IUserStatsItem,
} from "./chartsByObjects";

type DateRange = { date_from: number; date_to: number };

export enum RangeType {
  Today = "today",
  Yesterday = "yesterday",
  Last10 = "last10",
  From21 = "from21",
  Custom = "custom",
}

const RangeLabels: Record<RangeType, string> = {
  [RangeType.Today]: "Сегодня",
  [RangeType.Yesterday]: "Вчера",
  [RangeType.Last10]: "Последние 10 дней",
  [RangeType.From21]: "c 21-ого числа",
  [RangeType.Custom]: "Произвольный период",
};

const RangeOptions = Object.entries(RangeLabels).map(([value, label]) => ({
  value,
  label,
}));

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
  const [dateFilterMode, setDateFilterMode] = React.useState<RangeType>(
    role === RoleId.USER ? RangeType.From21 : RangeType.Last10,
  );
  const [range, setRange] = React.useState<DateRange>({
    date_from:
      role === RoleId.USER
        ? getLast21stDate().getTime()
        : getTenDaysAgo().getTime(),
    date_to: new Date().getTime(),
  });

  const [showMode, setShowMode] = React.useState<
    "all" | "byUsers" | "byObjects"
  >("all");

  const updateRange = (type: RangeType) => {
    setDateFilterMode(type);

    let from: Date;
    let to: Date = new Date();

    switch (type) {
      case RangeType.Today:
        from = getToday();
        to = new Date();
        break;
      case RangeType.Yesterday:
        from = new Date();
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to = new Date(from);
        to.setHours(23, 59, 59, 999);
        break;
      case RangeType.Last10:
        from = getTenDaysAgo();
        break;
      case RangeType.From21:
        from = getLast21stDate();
        break;
      case RangeType.Custom:
        // Для произвольного периода — ждем инпутов
        return;
    }

    setRange({
      date_from: from.getTime(),
      date_to: to.getTime(),
    });
  };

  const handleCustomChange = (key: "date_from" | "date_to", value: number) => {
    setRange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const description = React.useMemo(
    () => RangeLabels[dateFilterMode],
    [dateFilterMode],
  );

  const filteredShiftReportsData = React.useMemo(
    () =>
      shiftReportsData
        .slice()
        .sort((a, b) => a.date - b.date)
        .filter((el) => el.date >= range.date_from && el.date <= range.date_to),
    [shiftReportsData, range],
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

  const totalCountData: Record<
    string,
    { empty: number; notSigned: number; signed: number }
  > = React.useMemo(() => {
    const totalCostMap = filteredShiftReportsData.reduce(
      (
        acc: Record<
          string,
          {
            empty?: IShiftReportsList[];
            notSigned?: IShiftReportsList[];
            signed?: IShiftReportsList[];
          }
        >,
        val,
      ) => {
        const date = dateTimestampToLocalString(val.date);

        if (val.signed) {
          acc[date] = acc[date]
            ? acc[date].signed
              ? { ...acc[date], signed: [...acc[date].signed, val] }
              : { ...acc[date], signed: [val] }
            : { signed: [val] };
        } else if (val.shift_report_details_sum > 0) {
          acc[date] = acc[date]
            ? acc[date].notSigned
              ? { ...acc[date], notSigned: [...acc[date].notSigned, val] }
              : { ...acc[date], notSigned: [val] }
            : { notSigned: [val] };
        } else {
          acc[date] = acc[date]
            ? acc[date].empty
              ? { ...acc[date], empty: [...acc[date].empty, val] }
              : { ...acc[date], empty: [val] }
            : { empty: [val] };
        }

        return acc;
      },
      {},
    );

    const result = Object.keys(totalCostMap).reduce(
      (
        acc: Record<
          string,
          { empty: number; notSigned: number; signed: number }
        >,
        key: string,
      ) => {
        const usersEmpty = Array.from(
          new Set(totalCostMap[key].empty?.map((el) => el.user)),
        );

        const usersNotSigned = Array.from(
          new Set(totalCostMap[key].notSigned?.map((el) => el.user)),
        );

        const usersEusersSignedmpty = Array.from(
          new Set(totalCostMap[key].signed?.map((el) => el.user)),
        );

        acc[key] = {
          empty: usersEmpty?.length || 0,
          notSigned: usersNotSigned?.length || 0,
          signed: usersEusersSignedmpty?.length || 0,
        };
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
        ...value,
      })),
    [totalCountData],
  );

  const averageCostArray = React.useMemo(
    () =>
      Object.entries(totalCostData).map(([date, value]) => ({
        date,
        value: Math.round(
          value /
            (totalCountData[date].signed + totalCountData[date].notSigned),
        ),
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
        value: Math.round(value * 100) / 100,
      }));

      return result;
    } else {
      return [];
    }
  }, [filteredShiftReportsData, projectsMap, objectsMap]);

  const totalCostArrayByObjects = React.useMemo(() => {
    if (projectsMap && objectsMap) {
      const reportsWithObject = filteredShiftReportsData.map((el) => {
        const object = projectsMap[el.project]?.object;
        return { ...el, object };
      });

      const dataWithObject = reportsWithObject.reduce(
        (acc: Record<string, Record<string, IUserStatsItem[]>>, val) => {
          const record: IUserStatsItem = {
            user: val.user,
            status:
              val.shift_report_details_sum === 0
                ? "empty"
                : val.signed
                  ? "signed"
                  : "not-signed",
          };

          acc = {
            ...acc,

            [val.object]: {
              ...acc[val.object],
              [val.project]: [
                ...(acc[val.object] ? acc[val.object][val.project] || [] : []),
                record,
              ],
            },
          };
          return acc;
        },
        {},
      );

      const result: IObjectStatsItem[] = Object.entries(dataWithObject).map(
        ([object, projectsData]) => {
          const projects = Object.entries(projectsData).map(
            ([project, users]) => ({
              project,
              users,
            }),
          );

          const result: IObjectStatsItem = {
            object,
            done:
              projects.length &&
              projects.every((project) =>
                project.users.every((user) => user.status === "signed"),
              ),
            projects,
          };

          return result;
        },
      );

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
            style={{ width: 200 }}
            value={dateFilterMode}
            onChange={updateRange}
            options={RangeOptions}
          ></Select>

          {dateFilterMode === RangeType.Custom && (
            <DatePicker
              format={dateFormat}
              onChange={(value) =>
                handleCustomChange("date_from", value.valueOf())
              }
            />
          )}

          {dateFilterMode === RangeType.Custom && (
            <DatePicker
              format={dateFormat}
              onChange={(value) =>
                handleCustomChange("date_to", value.valueOf())
              }
            />
          )}

          <Select
            value={showMode}
            onChange={(value) => {
              if (value === "byObjects") {
                updateRange(RangeType.Today);
              }
              setShowMode(value);
            }}
            options={[
              { label: "По типу данных", value: "all" },
              { label: "По сотрудникам", value: "byUsers" },
              { label: "По объектам", value: "byObjects" },
            ]}
          ></Select>
        </Space>
      )}

      {showMode === "byUsers" && (
        <ChartsByUsers
          description={description}
          totalCostArrayByUser={totalCostArrayByUser}
        />
      )}

      {showMode === "byObjects" && (
        <ChartsByObjects totalCostArrayByObjects={totalCostArrayByObjects} />
      )}

      {showMode === "all" && (
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
