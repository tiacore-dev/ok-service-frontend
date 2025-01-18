import { IWorkPrice } from "./IWorkPrice";

export interface IWorkPricesList extends IWorkPrice {}

export interface IWorkPricesListColumn extends IWorkPricesList {
  key: string;
}
