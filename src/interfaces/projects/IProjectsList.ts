import { IProject } from "./IProject";

export interface IProjectsList extends IProject {}

export interface IProjectsListColumn extends IProjectsList {
  key: string;
}
