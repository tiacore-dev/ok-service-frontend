import { Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { EditableLeaveDialog } from "../../../components/ActionDialogs/EditableLeaveDialog/EditableLeaveDialog";

export const Filters = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <div className="leaves_filters">
      {currentRole === RoleId.ADMIN && (
        <Space>
          <EditableLeaveDialog />
        </Space>
      )}
    </div>
  );
};
