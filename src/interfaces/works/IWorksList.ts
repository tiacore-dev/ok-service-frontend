import { IWork } from "./IWork";

export interface IWorksList extends IWork {}

export interface IWorksListColumn extends IWorksList {
  key: string;
}
