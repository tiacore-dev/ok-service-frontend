import { IWorkPrice } from "../workPrices/IWorkPrice";
import { IMeasurementUnit } from "../measurementUnits/IMeasurementUnit";
import type { IWorkCategory } from "../workCategories/IWorkCategory";

export interface IWork {
  work_id?: string;
  name: string;
  category: IWorkCategory & {
    work_category_id: string;
  };
  measurement_unit: IMeasurementUnit;
  deleted?: boolean;
  work_prices?: IWorkPrice[];
  created_at?: number;
  created_by?: string;
}
