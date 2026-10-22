import * as React from "react";
import { useSelector } from "react-redux";
import { EditableObjectDialog } from "../../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { RoleId } from "../../../interfaces/roles/IRole";
import { getCurrentRole } from "../../../store/modules/auth";
import { ObjectReportExportButton } from "./ObjectReportExportButton";

export const Actions = () => {
  const currentRole = useSelector(getCurrentRole);

  const canServerExport =
    currentRole === RoleId.ADMIN || currentRole === RoleId.MANAGER;

  return currentRole === RoleId.ADMIN || canServerExport ? (
    <div className="objects_actions">
      {currentRole === RoleId.ADMIN && <EditableObjectDialog />}
      {canServerExport && <ObjectReportExportButton />}
    </div>
  ) : null;
};
