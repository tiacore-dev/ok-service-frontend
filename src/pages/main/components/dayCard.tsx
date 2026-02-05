import * as React from "react";
import { Card } from "antd";
import Meta from "antd/es/card/Meta";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";

type DayPayload = [
  string,
  {
    notOpened?: IShiftReportsListColumn[];
    empty?: IShiftReportsListColumn[];
    signed?: IShiftReportsListColumn[];
    notSigned?: IShiftReportsListColumn[];
  },
];

type UsersMap = Record<string, { name: string } | undefined>;

interface DayCardProps {
  data?: DayPayload;
  usersMap: UsersMap;
  ulClassName: string;
}

export const DayCard: React.FC<DayCardProps> = ({
  data,
  usersMap,
  ulClassName,
}) => {
  if (!data) return null;

  const [date, stats] = data;

  const sections: Array<{
    key: keyof typeof stats;
    title: string;
    liClassName: string;
  }> = [
    {
      key: "notOpened",
      title: "Смена не открыта",
      liClassName: "main__day__not-opened",
    },
    {
      key: "empty",
      title: "Смена не заполнена",
      liClassName: "main__day__empty",
    },
    {
      key: "notSigned",
      title: "Смена не согласована",
      liClassName: "main__day__not-signed",
    },
    {
      key: "signed",
      title: "Смена согласована",
      liClassName: "main__day__signed",
    },
  ];

  return (
    <Card>
      <Meta title={`Данные по сменам за ${date}`} />
      <div className="main__day">
        {sections.map(({ key, title, liClassName }) => {
          const arr = stats?.[key];
          if (!arr?.length) return null;

          return (
            <div className="main__day__el" key={key}>
              {title}: {arr.length}
              <ul className={ulClassName}>
                {arr.map((el) => (
                  <li className={liClassName} key={el.key}>
                    {usersMap[el.user]?.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
