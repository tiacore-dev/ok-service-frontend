import type {
  IObjectProjectStatsItem,
  IObjectWorkStats,
} from "../interfaces/objects/IObjectStats";

export const normalizeObjectWorkStats = (
  stats: IObjectProjectStatsItem["stats"],
): IObjectWorkStats => {
  const total: IObjectWorkStats = {
    project_work_quantity: 0,
    project_work_summ: 0,
    shift_report_details_quantity: 0,
    shift_report_details_summ: 0,
    shift_report_details_summ_by_estimate: 0,
    presented_quantity: 0,
    presented_summ: 0,
    accepted_quantity: 0,
    accepted_summ: 0,
  };
  const keys = Object.keys(total) as (keyof IObjectWorkStats)[];
  const isSummary = (
    value: IObjectProjectStatsItem["stats"],
  ): value is IObjectWorkStats =>
    keys.some((key) => typeof value[key] === "number" || value[key] === null);

  // The server returns a summary; api.json also allows statistics by work ID.
  if (isSummary(stats)) return stats;

  for (const stat of Object.values(stats)) {
    if (!stat) continue;

    for (const key of keys) {
      total[key] += stat[key] ?? 0;
    }
  }

  return total;
};
