import * as React from "react";
import { Card, Col, Row } from "antd";
import Meta from "antd/es/card/Meta";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  Tooltip,
  YAxis,
} from "recharts";
import { useSelector } from "react-redux";
import { getUsersMap } from "../../../store/modules/pages/selectors/users.selector";

interface IChartsByUsersProps {
  totalCostArrayByUser: {
    user: string;
    data: {
      date: string;
      value: number;
    }[];
  }[];
  description: string;
}

export const ChartsByUsers = (props: IChartsByUsersProps) => {
  const { totalCostArrayByUser, description } = props;

  const containerRef = React.useRef(null);
  const usersMap = useSelector(getUsersMap);
  const [width, setWidth] = React.useState(0);

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
      {totalCostArrayByUser.map((element) => (
        <Col ref={containerRef} key={element.user} xs={24} sm={12} md={8}>
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
              <YAxis
                tick={{ fill: "black" }}
                ticks={[0, 2500, 5000, 7500, 10000]}
                domain={[0, 10000]}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6940ff" name="Сумма" />
            </BarChart>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
