import * as React from "react";
import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { useUsersMap } from "../../../queries/users";
import { useProjectsMap } from "../../../queries/projects"; // поправь путь
import { DayCardGrouped } from "./dayCardGrouped";
import { useObjectsMap } from "../../../queries/objects";

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
  dayData: [
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

export const Charts = ({ dayData }: IChartsProps) => {
  const { usersMap } = useUsersMap();
  const { projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();

  return (
    <DayCardGrouped
      data={dayData}
      usersMap={usersMap}
      projectsMap={projectsMap}
      objectsMap={objectsMap}
    />
  );
};
