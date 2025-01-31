import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { worksDesktopColumns } from "./components/desktop.columns";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./works.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { worksMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IWorksListColumn } from "../../interfaces/works/IWorksList";
import { Link } from "react-router-dom";
import { useWorks } from "../../hooks/ApiActions/works";

export const Works = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.worksSettings.filters
  );

  const { getWorks } = useWorks();

  React.useEffect(() => {
    getWorks();
  }, [filters]);

  const worksData: IWorksListColumn[] = useSelector(
    (state: IState) => state.pages.works.data
  ).map((doc) => ({ ...doc, key: doc.work_id }));

  const isLoading = useSelector((state: IState) => state.pages.works.loading);

  const columns = React.useMemo(
    () =>
      isMobile() ? worksMobileColumns(navigate) : worksDesktopColumns(navigate),
    [navigate]
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[{ title: <Link to="/">Главная</Link> }, { title: "Работы" }]}
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
        <Table dataSource={worksData} columns={columns} loading={isLoading} />
      </Content>
    </>
  );
};
