import type { IPosition } from "./IPosition";

export interface IPositionsList extends IPosition {}

export interface IPositionsListColumn extends IPositionsList {
  key: string;
}
