import React, { useCallback, useEffect, useMemo } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Checkbox, DatePicker, Form, Select, Space } from "antd";
import { IShiftReport } from "../../../interfaces/shiftReports/IShiftReport";
import {
  clearCreateShiftReportState,
  editShiftReportAction,
} from "../../../store/modules/editableEntities/editableShiftReport";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableShiftReportDialog.less";
import { useShiftReports } from "../../../hooks/ApiActions/shift-reports";
import dayjs, { Dayjs } from "dayjs";
import { dateFormat } from "../../../utils/dateConverter";
import { getCurrentRole, getCurrentUserId } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

interface IEditableShiftReportDialogProps {
  shiftReport?: IShiftReport;
  iconOnly?: boolean;
}

export const EditableShiftReportDialog = (
  props: IEditableShiftReportDialogProps
) => {
  const { shiftReport, iconOnly } = props;
  const [object, setObject] = React.useState("");

  const { createShiftReport, editShiftReport } = useShiftReports();
  const buttonText = shiftReport ? "Редактировать" : "Создать";
  const popoverText = shiftReport
    ? "Редактировать отчет по смене"
    : "Создать отчет по смене";
  const buttonIcon = shiftReport ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = shiftReport
    ? "Редактирование отчета по смене"
    : "Создание отчета по смене";

  const userId = useSelector(getCurrentUserId);
  const role = useSelector(getCurrentRole);

  const dispatch = useDispatch();

  const data = useSelector(
    (state: IState) => state.editableEntities.editableShiftReport
  );

  const objectMap = useSelector(
    (state: IState) => state.pages.objects.data
  ).map((el) => ({
    label: el.name,
    value: el.object_id,
  }));

  const projectMapData = useSelector(
    (state: IState) => state.pages.projects.data
  );
  const filteredProjectMapData = useMemo(
    () => projectMapData.filter((el) => !object || el.object === object),
    [projectMapData, object]
  );

  const projectMap = useMemo(
    () =>
      filteredProjectMapData.map((el) => ({
        label: el.name,
        value: el.project_id,
      })),
    [filteredProjectMapData]
  );

  const userMap = useSelector((state: IState) => state.pages.users.data).map(
    (el) => ({
      label: el.name,
      value: el.user_id,
    })
  );

  const { sent, ...shiftReportData } = data;

  const handleConfirm = useCallback(() => {
    if (shiftReport) {
      editShiftReport(shiftReport.shift_report_id, shiftReportData);
    } else {
      createShiftReport({
        ...shiftReportData,
        user: role === RoleId.USER ? userId : shiftReportData.user,
      });
    }
  }, [shiftReport, shiftReportData, shiftReportData]);

  const handeOpen = useCallback(() => {
    if (shiftReport) {
      dispatch(editShiftReportAction.setShiftReportData(shiftReport));
    } else {
      dispatch(clearCreateShiftReportState());
    }
  }, [shiftReport, dispatch]);

  const date: Dayjs = data.date ? dayjs(data.date) : null;
  const handleDateChange = useCallback((value: Dayjs) => {
    dispatch(editShiftReportAction.setDate(value.valueOf()));
  }, []);

  React.useEffect(() => {
    if (filteredProjectMapData.length === 1) {
      dispatch(
        editShiftReportAction.setProject(filteredProjectMapData[0].project_id)
      );
    }
  }, [filteredProjectMapData]);

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handeOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly && popoverText}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_shiftReport_dialog">
          <Form layout="horizontal">
            {role !== RoleId.USER && (
              <Form.Item label="Исполнитель">
                <Select
                  value={data.user}
                  onChange={(value: string) =>
                    dispatch(editShiftReportAction.setUser(value))
                  }
                  options={userMap}
                  disabled={sent}
                />
              </Form.Item>
            )}

            <Form.Item label="Дата">
              <DatePicker
                value={date}
                onChange={handleDateChange}
                format={dateFormat}
                onFocus={(e) => e.target.blur()}
              />
            </Form.Item>

            <Form.Item label="Объект">
              <Select
                value={object}
                onChange={setObject}
                options={objectMap}
                disabled={sent}
              />
            </Form.Item>

            <Form.Item label="Спецификация">
              <Select
                value={data.project}
                onChange={(value: string) =>
                  dispatch(editShiftReportAction.setProject(value))
                }
                options={projectMap}
                disabled={sent}
              />
            </Form.Item>
            {role !== RoleId.USER && (
              <Form.Item label="Согласовано">
                <Checkbox
                  checked={data.signed}
                  onChange={() =>
                    dispatch(editShiftReportAction.toggleSigned())
                  }
                  disabled={sent}
                />
              </Form.Item>
            )}
          </Form>
        </Space>
      }
    />
  );
};
