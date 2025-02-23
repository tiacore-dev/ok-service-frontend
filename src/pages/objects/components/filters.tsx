import { Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { EditableObjectDialog } from "../../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <div className="objects_filters">
      {currentRole === RoleId.ADMIN && (
        <Space>
          <EditableObjectDialog />
        </Space>
      )}
    </div>
  );
};
