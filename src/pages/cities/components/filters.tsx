import { Space } from "antd";
import * as React from "react";
import { isMobile } from "../../../utils/isMobile";
import { EditableCityDialog } from "../../../components/ActionDialogs/EditableCityDialog/EditableCityDialog";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const currentRole = useSelector(getCurrentRole);

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="cities_filters"
    >
      {currentRole === RoleId.ADMIN && <EditableCityDialog />}
    </Space>
  );
};
