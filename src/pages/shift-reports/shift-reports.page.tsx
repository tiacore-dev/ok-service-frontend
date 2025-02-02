import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { shiftReportsDesktopColumns } from "./components/desktop.columns";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./shift-reports.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { shiftReportsMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IShiftReportsListColumn } from "../../interfaces/shiftReports/IShiftReportsList";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";

export const ShiftReports = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.shiftReportsSettings.filters
  );

  const { getShiftReports } = useShiftReports();

  React.useEffect(() => {
    getShiftReports();
  }, [filters]);

  const shiftReportsData: IShiftReportsListColumn[] = useSelector(
    (state: IState) => state.pages.shiftReports.data
  ).map((doc) => ({ ...doc, key: doc.shift_report_id }));

  const projectsMap = useSelector(getProjectsMap);
  const usersMap = useSelector(getUsersMap);

  const isLoading = useSelector(
    (state: IState) => state.pages.shiftReports.loading
  );

  const columns = React.useMemo(
    () =>
      isMobile()
        ? shiftReportsMobileColumns(navigate, projectsMap, usersMap)
        : shiftReportsDesktopColumns(navigate, projectsMap, usersMap),
    [navigate, projectsMap, usersMap]
  );
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          { title: "Отчеты по сменам" },
        ]}
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
        <Table
          dataSource={shiftReportsData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
