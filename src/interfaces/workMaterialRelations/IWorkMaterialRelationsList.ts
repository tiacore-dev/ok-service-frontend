import { IWorkMaterialRelation } from "./IWorkMaterialRelation";

export interface IWorkMaterialRelationsList extends IWorkMaterialRelation {}

export interface IWorkMaterialRelationsListColumn
  extends IWorkMaterialRelationsList {
  key: string;
}
