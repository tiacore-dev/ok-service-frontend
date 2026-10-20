import type {
  IObjectMaterialStats,
  IObjectProgressStats,
  IObjectProjectStatsItem,
  ObjectMaterialStats,
} from "../interfaces/objects/IObjectStats";
import { normalizeObjectWorkStats } from "./normalizeObjectWorkStats";

const materialKeys: (keyof IObjectMaterialStats)[] = [
  "project_material_quantity",
  "project_material_summ",
  "shift_report_material_quantity",
  "shift_report_material_summ_by_estimate",
];

const isMaterialSummary = (
  stats: ObjectMaterialStats,
): stats is IObjectMaterialStats =>
  materialKeys.some(
    (key) => typeof stats[key] === "number" || stats[key] === null,
  );

export const getObjectProgressStats = (
  workStats: IObjectProjectStatsItem["stats"],
  materialStats?: ObjectMaterialStats | null,
): IObjectProgressStats => {
  const stats = normalizeObjectWorkStats(workStats);
  const materials = materialStats
    ? isMaterialSummary(materialStats)
      ? [materialStats]
      : Object.values(materialStats)
    : [];
  let specificationMaterialSumm = 0;
  let completedMaterialSumm = 0;

  for (const material of materials) {
    specificationMaterialSumm += material?.project_material_summ ?? 0;
    completedMaterialSumm +=
      material?.shift_report_material_summ_by_estimate ?? 0;
  }

  return {
    ...stats,
    completed_summ:
      (stats.shift_report_details_summ ?? 0) + completedMaterialSumm,
    completed_estimate_summ:
      (stats.shift_report_details_summ_by_estimate ?? 0) + completedMaterialSumm,
    specification_summ:
      (stats.project_work_summ ?? 0) + specificationMaterialSumm,
  };
};
