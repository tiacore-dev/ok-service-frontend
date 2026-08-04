import { IWorkPrice } from "../workPrices/IWorkPrice";
import { IMeasurementUnit } from "../measurementUnits/IMeasurementUnit";

export interface IWork {
  work_id?: string;
  name: string;
  category: {
    work_category_id: string;
    name: string;
  };
  measurement_unit: IMeasurementUnit;
  deleted?: boolean;
  work_prices?: IWorkPrice[];
  created_at?: number;
  created_by?: string;
}
