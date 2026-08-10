import { IMeasurementUnit } from "../measurementUnits/IMeasurementUnit";

export interface IMaterial {
  material_id?: string;
  name: string;
  measurement_unit: IMeasurementUnit;
  created_at?: number;
  created_by?: string;
  deleted?: boolean;
}
