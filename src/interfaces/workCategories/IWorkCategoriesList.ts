import { IWorkCategory } from "./IWorkCategory";

export interface IWorkCategoriesList extends IWorkCategory {}

export interface IWorkCategoriesListColumn extends IWorkCategoriesList {
  key: string;
}
