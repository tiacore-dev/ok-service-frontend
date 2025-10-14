import * as React from "react";
import { Card, Col, Row } from "antd";
import Meta from "antd/es/card/Meta";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { isMobile } from "../../../utils/isMobile";
import { formatNumber } from "../../../utils/formatNumber";
import { CustomTooltip } from "./customTooltip";

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
  clientData: IClientData[];
  description: string;
}

const colors = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#FF5733",
  "#E91E63",
  "#4CAF50",
  "#9C27B0",
];

export const Charts = (props: IChartsProps) => {
  const {
    totalCostArray,
    totalCountArray,
    averageCostArray,
    clientData,
    description,
  } = props;

  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  const role = useSelector(getCurrentRole);
  const mobile = isMobile();
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
      <Col ref={containerRef} key={0} xs={24} sm={12}>
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
            <Bar dataKey="value" fill="#4090ff" name="Сумма">
              <LabelList dataKey="value" position="top" fill="black" />
            </Bar>
          </BarChart>
        </Card>
      </Col>

      {role !== RoleId.USER && (
        <Col key={1} xs={24} sm={12}>
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
                fill="#4090ff"
                name="Не согласовано"
                stackId="a"
              />
              <Bar
                dataKey="empty"
                fill="#ffd940ff"
                name="Не заполнено"
                stackId="a"
              />
            </BarChart>
          </Card>
        </Col>
      )}

      {role !== RoleId.USER && (
        <Col key={2} xs={24} sm={12}>
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
                stroke="#4090ff"
                strokeWidth={2}
              >
                <LabelList dataKey="value" position="top" fill="black" />
              </Line>
            </LineChart>
          </Card>
        </Col>
      )}

      <Col key={3} xs={24} sm={12}>
        <Card>
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
            >
              {clientData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {!mobile && (
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => {
                  const dataItem = clientData.find(
                    (item) => item.name === value,
                  );
                  return `${value}: ${formatNumber(dataItem?.value || 0)}`;
                }}
                wrapperStyle={{
                  paddingLeft: "20px",
                  fontSize: "16px",
                }}
              />
            )}
          </PieChart>
        </Card>
      </Col>
    </Row>
  );
};
