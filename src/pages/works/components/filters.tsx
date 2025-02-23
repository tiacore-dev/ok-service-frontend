import { Button, Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "../../../utils/isMobile";
import { EditableWorkDialog } from "../../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { useNavigate } from "react-router-dom";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="works_filters"
    >
      <Button
        onClick={() => {
          navigate("categories");
        }}
      >
        Категории
      </Button>
      {currentRole === RoleId.ADMIN && <EditableWorkDialog />}
    </Space>
  );
};
