import { Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "../../../utils/isMobile";
import { EditableUserDialog } from "../../../components/ActionDialogs/EditableUserDialog/EditableUserDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="users_filters"
    >
      {currentRole === RoleId.ADMIN && <EditableUserDialog />}
    </Space>
  );
};
