import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { objectsDesktopColumns } from "./components/desktop.columns";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./objects.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { objectsMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IObjectsListColumn } from "../../interfaces/objects/IObjectsList";
import { useObjects } from "../../hooks/ApiActions/objects";
import {
  getObjectStatusesMap,
  getObjectStatusesOptions,
} from "../../store/modules/dictionaries/selectors/objectStatuses.selector";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { useUsers } from "../../hooks/ApiActions/users";

export const Objects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.objectsSettings.filters
  );

  const { getObjects } = useObjects();
  const { getUsers } = useUsers();

  React.useEffect(() => {
    getObjects();
    getUsers();
  }, [filters]);

  const objectsData: IObjectsListColumn[] = useSelector(
    (state: IState) => state.pages.objects.data
  ).map((doc) => ({ ...doc, key: doc.object_id }));

  const isLoading = useSelector((state: IState) => state.pages.objects.loading);
  const statusMap = useSelector(getObjectStatusesMap);
  const usersMap = useSelector(getUsersMap);
  const statusOptions = useSelector(getObjectStatusesOptions);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? objectsMobileColumns(navigate, statusMap)
        : objectsDesktopColumns(navigate, statusMap, usersMap, statusOptions),
    [navigate, statusMap, usersMap, statusOptions]
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Объекты" },
        ]}
      />
      <Content
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <Filters />
        <Table dataSource={objectsData} columns={columns} loading={isLoading} />
      </Content>
    </>
  );
};
