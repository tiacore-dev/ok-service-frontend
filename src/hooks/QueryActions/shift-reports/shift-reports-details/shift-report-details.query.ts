import { useQuery } from "@tanstack/react-query";
import { IShiftReportDetailsList } from "../../../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { fetchShiftReportDetails } from "../../../../api/shift-report-details.api";

export const useShiftReportDetailsQuery = (
  shiftReportId: string | undefined,
) => {
  return useQuery<IShiftReportDetailsList[]>({
    queryKey: ["shiftReportDetails", shiftReportId],
    queryFn: () => {
      if (!shiftReportId) {
        return Promise.resolve([]);
      }
      return fetchShiftReportDetails({ shift_report: shiftReportId }).then(
        (data) => data.shift_report_details,
      );
    },
    enabled: !!shiftReportId,
  });
};
