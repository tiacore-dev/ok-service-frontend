import {
  getShiftReportsFailure,
  getShiftReportsRequest,
  getShiftReportsSuccess,
} from "../../store/modules/pages/shift-reports.state";
import { useApi } from "../useApi";
import {
  getShiftReportFailure,
  getShiftReportRequest,
  getShiftReportSuccess,
} from "../../store/modules/pages/shift-report.state";
import { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { IShiftReportsList } from "../../interfaces/shiftReports/IShiftReportsList";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { editShiftReportAction } from "../../store/modules/editableEntities/editableShiftReport";
import { useNavigate } from "react-router-dom";
import { useShiftReportDetails } from "./shift-report-detail";

export interface IEditableShiftReport
  extends Omit<IShiftReport, "shiftReport_id" | "number"> {}

export const useShiftReports = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const { getShiftReportDetails } = useShiftReportDetails();

  const getShiftReports = () => {
    dispatch(getShiftReportsRequest());
    apiGet<{ shift_reports: IShiftReportsList[] }>(
      "shift_reports",
      "all",
      undefined,
      { sort_by: "date", sort_order: "desc" }
    )
      .then((shiftReportsData) => {
        dispatch(getShiftReportsSuccess(shiftReportsData.shift_reports));
      })
      .catch((err) => {
        dispatch(getShiftReportsFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении списка отчетов по смене",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const getShiftReport = (shiftReportId: string) => {
    dispatch(getShiftReportRequest());
    apiGet<{ shift_report: IShiftReport }>(
      "shift_reports",
      `${shiftReportId}/view`
    )
      .then((shiftReportData) => {
        dispatch(getShiftReportSuccess(shiftReportData.shift_report));
      })
      .catch((err) => {
        dispatch(getShiftReportFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении отчета по смене",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const createShiftReport = (
    createbleShiftReportData: IEditableShiftReport
  ) => {
    dispatch(editShiftReportAction.sendShiftReport());

    apiPost<{ shift_report_id: string }>(
      "shift_reports",
      "add",
      createbleShiftReportData
    )
      .then((data) => {
        console.log(data);
        navigate(`/shifts/${data.shift_report_id}`);
        notificationApi.success({
          message: `Успешно`,
          description: "Отчет по смене создан",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editShiftReportAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании отчета по смене",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const editShiftReport = (
    shift_report_id: string,
    editableShiftReportData: IEditableShiftReport
  ) => {
    dispatch(editShiftReportAction.sendShiftReport());

    apiPatch<{}>(
      "shift_reports",
      shift_report_id,
      "edit",
      editableShiftReportData
    )
      .then((response: { shift_report_id: string }) => {
        getShiftReport(response.shift_report_id);
        getShiftReportDetails({ shift_report: shift_report_id });
        notificationApi.success({
          message: `Успешно`,
          description: "Отчет по смене изменён",
          placement: "bottomRight",
          duration: 2,
        });
      })
      .catch((err) => {
        dispatch(editShiftReportAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении отчета по смене",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  const deleteShiftReport = (shiftReportId: string) => {
    apiDelete<{}>("shift_reports", shiftReportId, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Отчет по смене удалён",
          placement: "bottomRight",
          duration: 2,
        });
        navigate("/shifts");
        getShiftReports();
      })
      .catch((err) => {
        console.log("deleteShiftReportFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении отчета по смене",
          placement: "bottomRight",
          duration: 2,
        });
      });
  };

  return {
    getShiftReports,
    getShiftReport,
    createShiftReport,
    editShiftReport,
    deleteShiftReport,
  };
};
