import * as React from "react";
import { Breadcrumb, Button, Card, Checkbox, Layout, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { EditableShiftReportDialog } from "../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
// import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { dateTimestampToLocalString } from "../../utils/dateConverter";

export const ShiftReport = () => {
  const { Content } = Layout;
  const usersMap = useSelector(getUsersMap);
  const projectsMap = useSelector(getProjectsMap);

  const routeParams = useParams();
  const { getShiftReport, deleteShiftReport } = useShiftReports();

  React.useEffect(() => {
    getShiftReport(routeParams.shiftId);
  }, []);

  const shiftReportData = useSelector(
    (state: IState) => state.pages.shiftReport.data
  );
  const isLoaded = useSelector(
    (state: IState) => state.pages.shiftReport.loaded
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/shifts">Спецификации</Link>,
          },
          { title: shiftReportData?.shift_report_id },
        ]}
      />
      {isLoaded &&
      shiftReportData &&
      routeParams.shiftId === shiftReportData.shift_report_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title
            level={3}
          >{`Отчет по смене за ${dateTimestampToLocalString(shiftReportData.date)}, ${usersMap[shiftReportData.user]?.name}`}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            <EditableShiftReportDialog shiftReport={shiftReportData} />,
            {/* <DeleteShiftReportDialog
              onDelete={() => {
                deleteShiftReport(shiftReportData.shiftReport_id);
              }}
              name={shiftReportData.name}
            /> */}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Исполнитель: {usersMap[shiftReportData.user]?.name}</p>
            <p>Дата: {dateTimestampToLocalString(shiftReportData.date)}</p>
            <p>ID: {shiftReportData.shift_report_id}</p>
            <p>Спецификация: {projectsMap[shiftReportData.project]?.name}</p>
            <p>
              Прораб:{" "}
              {
                usersMap[projectsMap[shiftReportData.project]?.project_leader]
                  ?.name
              }
            </p>
            <Checkbox checked={shiftReportData.signed} />

            {!shiftReportData.signed && (
              <div>
                <Button type="primary">Согласовано</Button>
              </div>
            )}
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
