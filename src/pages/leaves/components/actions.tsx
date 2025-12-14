import * as React from "react";
import { useSelector } from "react-redux";
import { EditableLeaveDialog } from "../../../components/ActionDialogs/EditableLeaveDialog/EditableLeaveDialog";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";

export const Actions = () => {
  const currentRole = useSelector(getCurrentRole);

  return currentRole === RoleId.ADMIN ? (
    <div className="leaves_actions">
      <EditableLeaveDialog />
    </div>
  ) : null;
};
