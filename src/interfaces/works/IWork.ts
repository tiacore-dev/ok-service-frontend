import { IWorkPrice } from "../workPrices/IWorkPrice";

export interface IWork {
  work_id?: string;
  name: string;
  category: {
    work_category_id: string;
    name: string;
  };
  measurement_unit: string;
  deleted?: boolean;
  work_prices?: IWorkPrice[];
  created_at?: number;
  created_by?: string;
}
