import { IProject } from "./IProject";
import type { IObjectWorkStats } from "../objects/IObjectStats";

export interface IProjectsList extends IProject {}

export interface IProjectsListColumn extends IProjectsList {
  key: string;
  stats?: IObjectWorkStats;
  children?: IProjectsListColumn[];
  isWork?: boolean;
}
