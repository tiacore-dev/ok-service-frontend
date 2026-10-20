import { IProject } from "./IProject";
import type { IObjectProgressStats } from "../objects/IObjectStats";

export interface IProjectsList extends IProject {}

export interface IProjectsListColumn extends IProjectsList {
  key: string;
  stats?: IObjectProgressStats;
  children?: IProjectsListColumn[];
  isWork?: boolean;
}
