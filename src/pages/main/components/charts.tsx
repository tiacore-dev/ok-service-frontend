import * as React from "react";
import { Card, Col, Row } from "antd";
import Meta from "antd/es/card/Meta";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { CustomTooltip } from "./customTooltip";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { useUsersMap } from "../../../queries/users";
import { DayCard } from "./dayCard";

export interface ITotalCost {
  date: string;
  value: number;
}

export interface ITotalCount {
  date: string;
  empty: number;
  emptyData: string[];
  notSigned: number;
  notSignedData: string[];
  signed: number;
  signedData: string[];
}

export interface IAverageCost {
  date: string;
  value: number;
}

export interface IClientData {
  name: string;
  value: number;
}

interface IChartsProps {
  totalCostArray: ITotalCost[];
  totalCountArray: ITotalCount[];
  averageCostArray: IAverageCost[];
  yesterdayData: [
    string,
    {
      notOpened?: IShiftReportsListColumn[];
      empty?: IShiftReportsListColumn[];
      signed?: IShiftReportsListColumn[];
      notSigned?: IShiftReportsListColumn[];
    },
  ];
  todayData: [
    string,
    {
      notOpened?: IShiftReportsListColumn[];
      empty?: IShiftReportsListColumn[];
      signed?: IShiftReportsListColumn[];
      notSigned?: IShiftReportsListColumn[];
    },
  ];
  description: string;
}

export const Charts = (props: IChartsProps) => {
  const {
    totalCostArray,
    totalCountArray,
    averageCostArray,
    yesterdayData,
    todayData,
    description,
  } = props;

  const { usersMap } = useUsersMap();
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  const role = useSelector(getCurrentRole);
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

  return (
    <Row gutter={[16, 16]}>
      <Col ref={containerRef} key={0} xs={24} sm={8}>
        <Card style={{ padding: "0 24px" }}>
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
            <Bar dataKey="value" fill="#6940ff" name="Сумма">
              <LabelList
                dataKey="value"
                position="top"
                fill="#404040"
                fontSize="10px"
              />
            </Bar>
          </BarChart>
        </Card>
      </Col>

      {role !== RoleId.USER && (
        <Col key={2} xs={24} sm={8}>
          <Card>
            <Meta title="Средняя стоимость смены" description={description} />
            <LineChart width={width - 84} height={400} data={averageCostArray}>
              <XAxis
                padding={{ left: 30, right: 30 }}
                tick={{ fill: "black" }}
                dataKey="date"
              />
              <YAxis tick={{ fill: "black" }} />
              <Tooltip />
              <Legend />
              <Line
                name="Средняя стоимость"
                type="monotone"
                dataKey="value"
                stroke="#6940ff"
                strokeWidth={2}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#404040"
                  fontSize="10px"
                />
              </Line>
            </LineChart>
          </Card>
        </Col>
      )}

      {role !== RoleId.USER && (
        <Col key={1} xs={24} sm={8}>
          <Card>
            <Meta title="Количество монтажников" description={description} />
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="signed"
                fill="#2bba23"
                name="Согласовано"
                stackId="a"
              />
              <Bar
                dataKey="notSigned"
                fill="#6940ffff"
                name="Не согласовано"
                stackId="a"
              />
              <Bar
                dataKey="empty"
                fill="#ffac40ff"
                name="Не заполнено"
                stackId="a"
              />
              <Bar
                dataKey="notOpened"
                fill="#a0a0b0"
                name="Не открыто"
                stackId="a"
              />
              <Bar stackId="a" dataKey="none" fill="transparent">
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#404040"
                  fontSize="10px"
                />
              </Bar>
            </BarChart>
          </Card>
        </Col>
      )}

      <Col key="yesterday" xs={24} sm={8}>
        <DayCard
          data={yesterdayData}
          usersMap={usersMap}
          ulClassName="main__day__ul-yesterday"
        />
      </Col>

      <Col key="today" xs={24} sm={16}>
        <DayCard
          data={todayData}
          usersMap={usersMap}
          ulClassName="main__day__ul-today"
        />
      </Col>
    </Row>
  );
};
