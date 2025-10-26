import { ICity } from "./ICity";

export interface ICitiesList extends ICity {}

export interface ICitiesListColumn extends ICitiesList {
  key: string;
}
