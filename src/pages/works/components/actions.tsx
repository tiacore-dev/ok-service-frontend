import { Button, Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EditableWorkDialog } from "../../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import { isMobile } from "../../../utils/isMobile";
import { IWorksList } from "../../../interfaces/works/IWorksList";
import { WorksExport } from "./export";

interface IActionsProps {
  works: IWorksList[];
  onImportClick?: () => void;
}

export const WorksActions = ({ works, onImportClick }: IActionsProps) => {
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);

  return (
    <div className="works_actions">
      <Space direction={isMobile() ? "vertical" : "horizontal"} wrap>
        {currentRole === RoleId.ADMIN && <EditableWorkDialog />}
        <Button
          onClick={() => {
            navigate("categories");
          }}
        >
          Категории
        </Button>
      </Space>

      <Space direction={isMobile() ? "vertical" : "horizontal"} wrap>
        {currentRole === RoleId.ADMIN && (
          <Button onClick={onImportClick}>Импорт CSV</Button>
        )}
        {currentRole === RoleId.ADMIN && <WorksExport works={works} />}
      </Space>
    </div>
  );
};
