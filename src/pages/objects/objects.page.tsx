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
import { IObjectListColumn } from "../../interfaces/objects/IObjectList";
import { useObjects } from "../../hooks/ApiActions/objects";
import { getObjectStatusesMap } from "../../store/modules/dictionaries/selectors/objectStatuses.selector";

export const Objects = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.objectsSettings.filters
  );

  const { getObjects } = useObjects();

  React.useEffect(() => {
    getObjects();
  }, [filters]);

  const objectsData: IObjectListColumn[] = useSelector(
    (state: IState) => state.pages.objects.data
  ).map((doc) => ({ ...doc, key: doc.object_id }));

  const isLoading = useSelector((state: IState) => state.pages.objects.loading);
  const statusMap = useSelector(getObjectStatusesMap);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? objectsMobileColumns(navigate, statusMap)
        : objectsDesktopColumns(navigate, statusMap),
    [navigate]
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[{ title: "Главная" }, { title: "Объекты" }]}
      />
      <Content
        style={{
          padding: isMobile() ? 0 : 8,
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
