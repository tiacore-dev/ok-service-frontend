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

export interface IEditableShiftReport
  extends Omit<IShiftReport, "shiftReport_id"> {}

export const useShiftReports = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);

  const getShiftReports = () => {
    dispatch(getShiftReportsRequest());
    apiGet<{ shift_reports: IShiftReportsList[] }>("shift_reports", "all")
      .then((shiftReportsData) => {
        dispatch(getShiftReportsSuccess(shiftReportsData.shift_reports));
      })
      .catch((err) => {
        dispatch(getShiftReportsFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении списка отчетов по смене",
          placement: "bottomRight",
        });
      });
  };

  const getShiftReport = (shiftReportId: string) => {
    dispatch(getShiftReportRequest());
    apiGet<{ shift_reports: IShiftReport }>(
      "shift_reports",
      `${shiftReportId}/view`
    )
      .then((shiftReportData) => {
        dispatch(getShiftReportSuccess(shiftReportData.shift_reports));
      })
      .catch((err) => {
        dispatch(getShiftReportFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при получении отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  const createShiftReport = (
    createbleShiftReportData: IEditableShiftReport
  ) => {
    dispatch(editShiftReportAction.sendShiftReport());

    apiPost<{}>("shift_reports", "add", createbleShiftReportData)
      .then(() => {
        navigate("/shifts");
        getShiftReports();
        notificationApi.success({
          message: `Успешно`,
          description: "Отчет по смене создан",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editShiftReportAction.saveError());
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  const editShiftReport = (
    shiftReport_id: string,
    editableShiftReportData: IEditableShiftReport
  ) => {
    dispatch(editShiftReportAction.sendShiftReport());

    apiPatch<{}>(
      "shift_reports",
      shiftReport_id,
      "edit",
      editableShiftReportData
    )
      .then(() => {
        navigate("/shiftReports");
        getShiftReports();
        notificationApi.success({
          message: `Успешно`,
          description: "Отчет по смене изменён",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        dispatch(editShiftReportAction.saveError());
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении отчета по смене",
          placement: "bottomRight",
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
