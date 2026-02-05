import { Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { EditableMaterialDialog } from "../../../components/ActionDialogs/EditableMaterialDialog/EditableMaterialDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { isMobile } from "../../../utils/isMobile";

export const MaterialsActions = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <div className="materials_actions">
      <Space direction={isMobile() ? "vertical" : "horizontal"} wrap>
        {currentRole === RoleId.ADMIN && <EditableMaterialDialog />}
      </Space>
    </div>
  );
};
