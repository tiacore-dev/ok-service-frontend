import { IObject } from "./IObject";

export interface IObjectsList extends IObject {}

export interface IObjectsListColumn extends IObjectsList {
  key: string;
}
