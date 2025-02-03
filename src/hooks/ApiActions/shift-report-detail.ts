import {
  getShiftReportDetailsFailure,
  getShiftReportDetailsRequest,
  getShiftReportDetailsSuccess,
} from "../../store/modules/pages/shift-report-details.state";
import { useApi } from "../useApi";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { NotificationContext } from "../../../root";
import { IShiftReportDetail } from "../../interfaces/shiftReportDetails/IShiftReportDetail";
import { IShiftReportDetailsList } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";

export interface IEditableShiftReportDetail
  extends Omit<IShiftReportDetail, "shift_report_detail_id"> {}

export const useShiftReportDetails = () => {
  const dispatch = useDispatch();
  const { apiGet, apiPost, apiPatch, apiDelete } = useApi();
  const notificationApi = useContext(NotificationContext);

  const getShiftReportDetails = (params: Record<string, string>) => {
    dispatch(getShiftReportDetailsRequest());
    apiGet<{ shift_report_details: IShiftReportDetailsList[] }>(
      "shift_report_details",
      "all",
      undefined,
      params
    )
      .then((shiftReportDetailsData) => {
        dispatch(
          getShiftReportDetailsSuccess(
            shiftReportDetailsData.shift_report_details
          )
        );
      })
      .catch((err) => {
        dispatch(getShiftReportDetailsFailure(err));
        notificationApi.error({
          message: `Ошибка`,
          description:
            "Возникла ошибка при получении списка записей отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  const createShiftReportDetail = (
    createbleShiftReportDetailData: IEditableShiftReportDetail
  ) => {
    apiPost<{ work: IShiftReportDetail }>(
      "shift_report_details",
      "add",
      createbleShiftReportDetailData
    )
      .then(() => {
        getShiftReportDetails({ work: createbleShiftReportDetailData.work });
        notificationApi.success({
          message: `Успешно`,
          description: "Запись отчета по смене создана",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("getObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при создании записи отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  const editShiftReportDetail = (
    shift_report_detail_id: string,
    editableShiftReportDetailData: IEditableShiftReportDetail
  ) => {
    apiPatch<{}>(
      "shift_report_details",
      shift_report_detail_id,
      "edit",
      editableShiftReportDetailData
    )
      .then(() => {
        getShiftReportDetails({ work: editableShiftReportDetailData.work });
        notificationApi.success({
          message: `Успешно`,
          description: "Запись отчета по смене изменена",
          placement: "bottomRight",
        });
      })
      .catch((err) => {
        console.log("editObjectFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при изменении записи отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  const deleteShiftReportDetail = (
    shift_report_detail_id: string,
    work_id: string
  ) => {
    apiDelete<{}>("shift_report_details", shift_report_detail_id, "delete/hard")
      .then(() => {
        notificationApi.success({
          message: `Успешно`,
          description: "Запись отчета по смене удалена",
          placement: "bottomRight",
        });
        getShiftReportDetails({ work: work_id });
      })
      .catch((err) => {
        console.log("deleteWorkFailure", err);
        notificationApi.error({
          message: `Ошибка`,
          description: "Возникла ошибка при удалении записи отчета по смене",
          placement: "bottomRight",
        });
      });
  };

  return {
    getShiftReportDetails,
    createShiftReportDetail,
    editShiftReportDetail,
    deleteShiftReportDetail,
  };
};
