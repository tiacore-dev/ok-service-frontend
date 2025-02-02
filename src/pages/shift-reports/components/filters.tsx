import { Button, Space } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { setShiftReportsFiltersName } from "../../../store/modules/settings/shift-reports";
import Search from "antd/es/input/Search";
import { isMobile } from "../../../utils/isMobile";
import { EditableShiftReportDialog } from "../../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";

export const Filters = () => {
  const filters = useSelector(
    (state: IState) => state.settings.shiftReportsSettings.filters
  );
  const dispatch = useDispatch();

  const numberChangeHandler = (name: string) => {
    dispatch(setShiftReportsFiltersName(name));
  };

  return (
    <div className="shift-reports_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <Search
          placeholder="Поиск по наименованию"
          onSearch={numberChangeHandler}
        />
        <EditableShiftReportDialog />
      </Space>
    </div>
  );
};
