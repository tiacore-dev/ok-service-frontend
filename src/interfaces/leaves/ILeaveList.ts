import { ILeave } from "./ILeave";

export interface ILeaveList extends ILeave {}

export interface ILeaveListColumn extends ILeaveList {
  key: string;
}
