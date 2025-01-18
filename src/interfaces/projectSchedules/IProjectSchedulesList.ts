import { IProjectSchedules } from "./IProjectSchedule";

export interface IProjectSchedulessList extends IProjectSchedules {}

export interface IProjectSchedulessListColumn extends IProjectSchedulessList {
  key: string;
}
