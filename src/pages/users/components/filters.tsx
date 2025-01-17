import { Space } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { setUsersFiltersName } from "../../../store/modules/settings/users";
import Search from "antd/es/input/Search";
import { isMobile } from "../../../utils/isMobile";
import { EditableUserDialog } from "../../../components/ActionDialogs/EditableUserDialog/EditableUserDialog";

export const Filters = () => {
  const filters = useSelector(
    (state: IState) => state.settings.usersSettings.filters
  );
  const dispatch = useDispatch();

  const numberChangeHandler = (name: string) => {
    dispatch(setUsersFiltersName(name));
  };

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="users_filters"
    >
      <Search placeholder="Поиск по имени" onSearch={numberChangeHandler} />
      <EditableUserDialog />
    </Space>
  );
};
