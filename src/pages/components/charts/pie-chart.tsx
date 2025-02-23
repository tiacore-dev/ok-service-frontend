import { Pie } from "@ant-design/charts";
import * as React from "react";

export const PieChart = () => {
  const clientData = [
    { client: "Client 1", value: 125 },
    { client: "Client 2", value: 236 },
    { client: "Client 3", value: 698 },
  ];

  const config = {
    data: clientData,
    angleField: "value", // Поле для значений
    colorField: "client", // Поле для разделения по цветам
    radius: 0.8, // Радиус диаграммы
    label: {
      type: "inner", // Метки внутри секторов
      offset: "-30%", // Смещение меток
      content: "{percentage}", // Отображение процентов
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    tooltip: {
      fields: ["client", "value"],
      formatter: (datum: { client: string; value: string }) => {
        return {
          name: datum.client,
          value: datum.value,
        };
      },
    },
    legend: {
      position: "bottom", // Положение легенды
    },
    interactions: [{ type: "element-active" }], // Взаимодействие при наведении
  };

  return (
    <Pie
      data={clientData}
      angleField={"value"}
      colorField={"client"}
      radius={0.8}
    />
  );
};
