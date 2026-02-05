import { IMaterial } from "./IMaterial";

export interface IMaterialsList extends IMaterial {}

export interface IMaterialsListColumn extends IMaterialsList {
  key: string;
}
