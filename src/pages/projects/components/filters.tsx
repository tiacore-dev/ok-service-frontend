import { Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { EditableProjectDialog } from "../../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <div className="projects_filters">
      {currentRole !== RoleId.USER && (
        <Space>
          <EditableProjectDialog />
        </Space>
      )}
    </div>
  );
};
