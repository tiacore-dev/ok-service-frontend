import { Button, Space } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { setWorksFiltersName } from "../../../store/modules/settings/works";
import Search from "antd/es/input/Search";
import { isMobile } from "../../../utils/isMobile";
import { EditableWorkDialog } from "../../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { useNavigate } from "react-router-dom";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";

export const Filters = () => {
  const filters = useSelector(
    (state: IState) => state.settings.worksSettings.filters
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole)

  const numberChangeHandler = (name: string) => {
    dispatch(setWorksFiltersName(name));
  };

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="works_filters"
    >
      <Search placeholder="Поиск по имени" onSearch={numberChangeHandler} />
      <Button
        onClick={() => {
          navigate("categories");
        }}
      >
        {" "}
        Категории{" "}
      </Button>
      {currentRole === RoleId.ADMIN && <EditableWorkDialog />}
    </Space>
  );
};
