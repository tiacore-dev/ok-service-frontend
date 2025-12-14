import * as React from "react";
import { useSelector } from "react-redux";
import { EditableObjectDialog } from "../../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";

export const Actions = () => {
  const currentRole = useSelector(getCurrentRole);

  return currentRole === RoleId.ADMIN ? (
    <div className="objects_actions">
      <EditableObjectDialog />
    </div>
  ) : null;
};
