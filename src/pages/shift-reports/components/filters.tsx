import { Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import { EditableShiftReportDialog } from "../../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";

export const Filters = () => {
  return (
    <div className="shift-reports_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <EditableShiftReportDialog />
      </Space>
    </div>
  );
};
