import { useQuery } from "@tanstack/react-query";
import { fetchShiftReportMaterials } from "../../../../api/shift-report-materials.api";
import { IShiftReportMaterialsList } from "../../../../interfaces/shiftReportMaterials/IShiftReportMaterialsList";

export const useShiftReportMaterialsQuery = (
  shiftReportId: string | undefined,
) => {
  return useQuery<IShiftReportMaterialsList[]>({
    queryKey: ["shiftReportMaterials", shiftReportId],
    queryFn: () => {
      if (!shiftReportId) {
        return Promise.resolve([]);
      }
      return fetchShiftReportMaterials({ shift_report: shiftReportId }).then(
        (data) => data.shift_report_materials,
      );
    },
    enabled: !!shiftReportId,
  });
};
