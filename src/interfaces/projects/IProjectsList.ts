import { IProject } from "./IProject";

export interface IProjectList extends IProject {}

export interface IProjectListColumn extends IProjectList {
  key: string;
}
