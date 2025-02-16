import { Button, Space } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { setObjectsFiltersName } from "../../../store/modules/settings/objects";
import Search from "antd/es/input/Search";
import { isMobile } from "../../../utils/isMobile";
import { PlusCircleTwoTone } from "@ant-design/icons";
import { EditableObjectDialog } from "../../../components/ActionDialogs/EditableObjectDialog/EditableObjectDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const filters = useSelector(
    (state: IState) => state.settings.objectsSettings.filters
  );
  const dispatch = useDispatch();

  const numberChangeHandler = (name: string) => {
    dispatch(setObjectsFiltersName(name));
  };
  const currentRole = useSelector(getCurrentRole)

  return (
    <div className="objects_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <Search
          placeholder="Поиск по наименованию"
          onSearch={numberChangeHandler}
        />
      </Space>
      {currentRole === RoleId.ADMIN && <Space>
        <EditableObjectDialog />
      </Space>}
    </div>
  );
};
