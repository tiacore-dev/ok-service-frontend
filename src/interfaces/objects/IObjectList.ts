import { IObject } from "./IObject";

export interface IObjectList extends IObject {}

export interface IObjectListColumn extends IObjectList {
  key: string;
}
