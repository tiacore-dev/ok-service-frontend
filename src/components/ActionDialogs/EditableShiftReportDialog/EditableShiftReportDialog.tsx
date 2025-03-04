import React, { useCallback, useMemo } from "react";
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
import { getModalContentWidth } from "../../../utils/pageSettings";
import { getProjectsMap } from "../../../store/modules/pages/selectors/projects.selector";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";

const modalContentWidth = getModalContentWidth();
interface IEditableShiftReportDialogProps {
  shiftReport?: IShiftReport;
  iconOnly?: boolean;
}

export const EditableShiftReportDialog = (
  props: IEditableShiftReportDialogProps,
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
    (state: IState) => state.editableEntities.editableShiftReport,
  );

  const objectMap = useSelector(
    (state: IState) => state.pages.objects.data,
  ).map((el) => ({
    label: el.name,
    value: el.object_id,
  }));

  const projectsData = useSelector(
    (state: IState) => state.pages.projects.data,
  );

  const projectsMap = useSelector(getProjectsMap);

  const filteredProjectMapData = useMemo(
    () => projectsData.filter((el) => !object || el.object === object),
    [projectsData, object],
  );

  const projectMap = useMemo(
    () =>
      filteredProjectMapData.map((el) => ({
        label: el.name,
        value: el.project_id,
      })),
    [filteredProjectMapData],
  );

  const userMap = useSelector((state: IState) => state.pages.users.data)
    .filter((user) => user.role === RoleId.USER)
    .map((el) => ({
      label: el.name,
      value: el.user_id,
    }));

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
      if (projectsMap) {
        setObject(projectsMap[shiftReport.project]?.object);
      }
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
        editShiftReportAction.setProject(filteredProjectMapData[0].project_id),
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
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
            {role !== RoleId.USER && (
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label="Исполнитель"
              >
                <Select
                  showSearch
                  filterOption={selectFilterHandler}
                  value={data.user}
                  onChange={(value: string) =>
                    dispatch(editShiftReportAction.setUser(value))
                  }
                  options={userMap}
                  disabled={sent}
                />
              </Form.Item>
            )}

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Дата"
            >
              <DatePicker
                value={date}
                onChange={handleDateChange}
                format={dateFormat}
                onFocus={(e) => e.target.blur()}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Объект"
            >
              <Select
                showSearch
                filterOption={selectFilterHandler}
                value={object}
                onChange={setObject}
                options={objectMap}
                disabled={sent}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Спецификация"
            >
              <Select
                showSearch
                filterOption={selectFilterHandler}
                value={data.project}
                onChange={(value: string) =>
                  dispatch(editShiftReportAction.setProject(value))
                }
                options={projectMap}
                disabled={sent}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              label="Ночная смена (+25%)"
            >
              <Checkbox
                checked={data.night_shift}
                onChange={() =>
                  dispatch(editShiftReportAction.toggleNightShift())
                }
                disabled={sent}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              label="Особые условия (+25%)"
            >
              <Checkbox
                checked={data.extreme_conditions}
                onChange={() =>
                  dispatch(editShiftReportAction.toggleExtremeConditions())
                }
                disabled={sent}
              />
            </Form.Item>

            {role !== RoleId.USER && shiftReport?.signed && (
              <Form.Item
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
                label="Согласовано"
              >
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
