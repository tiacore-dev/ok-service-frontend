import { IProjectWork } from "./IProjectWork";

export interface IProjectWorksList extends IProjectWork {}

export interface IProjectWorksListColumn extends IProjectWorksList {
  key: string;
}
