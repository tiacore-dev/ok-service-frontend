import { Button, Space } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { setProjectsFiltersName } from "../../../store/modules/settings/projects";
import Search from "antd/es/input/Search";
import { isMobile } from "../../../utils/isMobile";
import { EditableProjectDialog } from "../../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";

export const Filters = () => {
  const filters = useSelector(
    (state: IState) => state.settings.projectsSettings.filters
  );
  const dispatch = useDispatch();

  const numberChangeHandler = (name: string) => {
    dispatch(setProjectsFiltersName(name));
  };

  return (
    <div className="projects_filters">
      <Space direction={isMobile() ? "vertical" : "horizontal"}>
        <Search
          placeholder="Поиск по наименованию"
          onSearch={numberChangeHandler}
        />
      </Space>
      <Space>
        <EditableProjectDialog />
      </Space>
    </div>
  );
};
