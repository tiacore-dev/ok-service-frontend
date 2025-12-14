import * as React from "react";
import { Layout, notification } from "antd";
import { AppHeader } from "../AppHeader/AppHeader";
import { AppFooter } from "../AppFooter/AppFooter";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import "./App.less";
import { Route, Routes } from "react-router-dom";
import { Main } from "../../pages/main/main";
import { isMobile } from "../../utils/isMobile";
import { pageHeight } from "../../utils/pageSettings";
import { Users } from "../../pages/users/users.page";
import { Cities } from "../../pages/cities/cities.page";
import { Login } from "../../pages/auth/component/login";
import { Account } from "../../pages/auth/component/account";
import { Objects } from "../../pages/objects/objects.page";
import { NotificationContext } from "../../contexts/NotificationContext";
import { User } from "../../pages/user/user";
import { Object } from "../../pages/object/object";
import { Project } from "../../pages/project/project";
import { Works } from "../../pages/works/works.page";
import { Work } from "../../pages/work/work";
import { WorkCategories } from "../../pages/work-categories/work-categories.page";
import { ShiftReports } from "../../pages/shift-reports/shift-reports.page";
import { ShiftReport } from "../../pages/shift-report/shift-report";
import { Assignment } from "../../pages/assignment/assignment";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "../../queries/users";
import { objectsKeys } from "../../queries/objects";
import { projectsKeys } from "../../queries/projects";
import { projectWorksKeys } from "../../queries/projectWorks";
import { worksKeys } from "../../queries/works";
import { workPricesKeys } from "../../queries/workPrices";
import { workCategoriesKeys } from "../../queries/workCategories";
import { objectStatusesKeys } from "../../queries/objectStatuses";
import { rolesKeys } from "../../queries/roles";
import { fetchObjectStatuses } from "../../api/object-statuses.api";
import { fetchRoles } from "../../api/roles.api";
import { citiesKeys } from "../../queries/cities";
import { Leaves } from "../../pages/leaves/leaves.page";
import { Leave } from "../../pages/leave/leave";
import { Manual } from "../../pages/manual/manual";

export const useloadSourse = (): {
  load: (access_token?: string) => Promise<void>;
  clearStates: () => void;
} => {
  const queryClient = useQueryClient();
  const notificationApi = React.useContext(NotificationContext);

  const clearStates = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["shiftReports"],
    });
    queryClient.invalidateQueries({
      queryKey: ["shiftReportDetails"],
    });
    queryClient.invalidateQueries({
      queryKey: ["shiftReport"],
    });
    queryClient.removeQueries({ queryKey: usersKeys.all() });
    queryClient.removeQueries({ queryKey: citiesKeys.all() });
    queryClient.removeQueries({ queryKey: objectsKeys.all() });
    queryClient.removeQueries({ queryKey: projectsKeys.all() });
    queryClient.removeQueries({ queryKey: projectWorksKeys.all() });
    queryClient.removeQueries({ queryKey: worksKeys.all() });
    queryClient.removeQueries({ queryKey: workPricesKeys.all() });
    queryClient.removeQueries({ queryKey: workCategoriesKeys.all() });
    queryClient.removeQueries({ queryKey: objectStatusesKeys.all() });
    queryClient.removeQueries({ queryKey: rolesKeys.all() });
  }, [queryClient]);

  const load = React.useCallback(
    async (_accessToken?: string) => {
      try {
        await queryClient.prefetchQuery({
          queryKey: objectStatusesKeys.list(),
          queryFn: fetchObjectStatuses,
        });
      } catch (err) {
        notificationApi.error({
          message: "Ошибка",
          description: "Ошибка при загрузке справочника статусов объектов",
        });
        console.error("fetchObjectStatuses", err);
      }

      try {
        await queryClient.prefetchQuery({
          queryKey: rolesKeys.list(),
          queryFn: fetchRoles,
        });
      } catch (err) {
        notificationApi.error({
          message: "Ошибка",
          description: "Ошибка при загрузке справочника ролей",
        });
        console.error("fetchRoles", err);
      }
    },
    [notificationApi, queryClient],
  );

  return { load, clearStates };
};

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;
  React.useEffect(() => {
    if (location.pathname !== "/login") {
      if (!isAuth) {
        navigate("/login");
      } else if (location.pathname === "/") {
        navigate("/home");
      }
    }
  }, [isAuth, location]);

  const mobile = isMobile();

  const [, contextHolder] = notification.useNotification();

  const fullScreenMode = useSelector(
    (state: IState) => state.settings.generalSettings.fullScreenMode,
  );

  const height = fullScreenMode ? null : pageHeight();

  return (
    <>
      <Layout>
        {isAuth && !mobile && !fullScreenMode && (
          <AppHeader isMobile={mobile} />
        )}

        <Layout
          style={{
            padding: mobile ? "0" : "0 24px",
            height: height,
            overflowX: "auto",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Routes>
            <Route path="/">
              <Route index={true} element={<></>} />
              <Route path="home" element={<Main />} />
              <Route path="account" element={<Account />} />
              <Route path="manual" element={<Manual />} />
              <Route path="login" element={<Login />} />
              <Route path="objects">
                <Route index={true} element={<Objects />} />
                <Route path=":objectId" element={<Object />} />
              </Route>
              <Route path="projects">
                <Route path=":projectId" element={<Project />} />
              </Route>
              <Route path="cities">
                <Route index={true} element={<Cities />} />
              </Route>
              <Route path="users">
                <Route index={true} element={<Users />} />
                <Route path=":userId" element={<User />} />
              </Route>
              <Route path="leaves">
                <Route index={true} element={<Leaves />} />
                <Route path=":leaveId" element={<Leave />} />
              </Route>
              <Route path="works">
                <Route index={true} element={<Works />} />
                <Route path="categories" element={<WorkCategories />} />
                <Route path=":workId" element={<Work />} />
              </Route>
              <Route path="shifts">
                <Route index={true} element={<ShiftReports />} />
                <Route path="assignment" element={<Assignment />} />
                <Route path=":shiftId" element={<ShiftReport />} />
              </Route>
            </Route>
          </Routes>
        </Layout>

        {isAuth && !fullScreenMode && <AppFooter />}
        {contextHolder}
      </Layout>
    </>
  );
};
