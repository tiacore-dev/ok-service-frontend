import {
  IShiftReportsList,
  IShiftReportsListColumn,
} from "../../../interfaces/shiftReports/IShiftReportsList";
import { dateTimestampToLocalString } from "../../../utils/dateConverter";

export const reduceShiftReportData = (
  acc: Record<
    string,
    {
      empty?: IShiftReportsListColumn[];
      signed?: IShiftReportsListColumn[];
      notSigned?: IShiftReportsListColumn[];
    }
  >,
  val: IShiftReportsList,
) => {
  const date = dateTimestampToLocalString(val.date);
  const report = { ...val, key: val.shift_report_id };
  if (val.signed) {
    acc[date] = acc[date]
      ? acc[date].signed
        ? { ...acc[date], signed: [...acc[date].signed, report] }
        : { ...acc[date], signed: [report] }
      : { signed: [report] };
  } else if (val.shift_report_details_sum > 0) {
    acc[date] = acc[date]
      ? acc[date].notSigned
        ? { ...acc[date], notSigned: [...acc[date].notSigned, report] }
        : { ...acc[date], notSigned: [report] }
      : { notSigned: [report] };
  } else {
    acc[date] = acc[date]
      ? acc[date].empty
        ? { ...acc[date], empty: [...acc[date].empty, report] }
        : { ...acc[date], empty: [report] }
      : { empty: [report] };
  }

  return acc;
};
