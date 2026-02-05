import { IProjectMaterial } from "./IProjectMaterial";

export interface IProjectMaterialsList extends IProjectMaterial {}

export interface IProjectMaterialsListColumn extends IProjectMaterialsList {
  key: string;
}
