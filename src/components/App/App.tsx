import * as React from "react";
import { Layout, notification } from "antd";
import { AppHeader } from "../AppHeader/AppHeader";
import { AppFooter } from "../AppFooter/AppFooter";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import "./App.less";
import { Route, Routes } from "react-router-dom";
import { Main } from "../../pages/main/main";
import { isMobile } from "../../utils/isMobile";
import { pageHeight } from "../../utils/pageSettings";
import { Users } from "../../pages/users/users.page";
import { Login } from "../../pages/auth/component/login";
import { Account } from "../../pages/auth/component/account";
import { Objects } from "../../pages/objects/objects.page";
import {
  clearObjectStatusesState,
  getObjectStatusesFailure,
  getObjectStatusesRequest,
  getObjectStatusesSuccess,
} from "../../store/modules/dictionaries/objectStatuses";
import { useApi } from "../../hooks/useApi";
import { IObjectStatus } from "../../interfaces/objectStatuses/IObjectStatus";
import { NotificationContext } from "../../contexts/NotificationContext";
import {
  clearRolesState,
  getRolesFailure,
  getRolesRequest,
  getRolesSuccess,
} from "../../store/modules/dictionaries/roles";
import { IRole } from "../../interfaces/roles/IRole";
import { User } from "../../pages/user/user";
import { Object } from "../../pages/object/object";
import { Project } from "../../pages/project/project";
import { Works } from "../../pages/works/works.page";
import { Work } from "../../pages/work/work";
import { WorkCategories } from "../../pages/work-categories/work-categories.page";
import { ShiftReports } from "../../pages/shift-reports/shift-reports.page";
import { ShiftReport } from "../../pages/shift-report/shift-report";
import { clearWorksState } from "../../store/modules/pages/works.state";
import { clearWorkPricesState } from "../../store/modules/pages/work-prices.state";
import { clearWorkCategoriesState } from "../../store/modules/pages/work-categories.state";
import { clearWorkState } from "../../store/modules/pages/work.state";
import { Assignment } from "../../pages/assignment/assignment";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "../../queries/users";
import { objectsKeys } from "../../queries/objects";
import { projectsKeys } from "../../queries/projects";
import { projectWorksKeys } from "../../queries/projectWorks";

export const useloadSourse = (): {
  load: (access_token?: string) => Promise<void>;
  clearStates: () => void;
} => {
  const queryClient = useQueryClient();
  const notificationApi = React.useContext(NotificationContext);
  const dispatch = useDispatch();
  const { apiGet } = useApi();

  const clearStates = React.useCallback(() => {
    dispatch(clearObjectStatusesState());
    dispatch(clearRolesState());
    dispatch(clearWorksState());
    dispatch(clearWorkState());
    dispatch(clearWorkPricesState());
    dispatch(clearWorkCategoriesState());

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
    queryClient.removeQueries({ queryKey: objectsKeys.all() });
    queryClient.removeQueries({ queryKey: projectsKeys.all() });
    queryClient.removeQueries({ queryKey: projectWorksKeys.all() });
  }, [dispatch, queryClient]);

  const load = React.useCallback(async (access_token?: string) => {
    // Загрузка справочника статусов объектов
    dispatch(getObjectStatusesRequest());
    try {
      const response: { object_statuses: IObjectStatus[]; msg: string } =
        await apiGet("object_statuses", "all", access_token);

      dispatch(getObjectStatusesSuccess(response.object_statuses));
    } catch (err) {
      notificationApi.error({
        message: "Ошибка",
        description: "Ошибка при загрузке справочника статусов объектов",
      });
      console.log("getObjectStatusesFailure ", err);
      dispatch(getObjectStatusesFailure(err));
    }

    // Загрузка справочника ролей
    dispatch(getRolesRequest());
    try {
      const response: { roles: IRole[]; msg: string } = await apiGet(
        "roles",
        "all",
        access_token,
      );

      dispatch(getRolesSuccess(response.roles));
    } catch (err) {
      notificationApi.error({
        message: "Ошибка",
        description: "Ошибка при загрузке справочника ролей",
      });
      console.log("getRolesFailure ", err);
      dispatch(getRolesFailure(err));
    }

  }, [apiGet, dispatch, notificationApi]);

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
              <Route path="login" element={<Login />} />
              <Route path="objects">
                <Route index={true} element={<Objects />} />
                <Route path=":objectId" element={<Object />} />
              </Route>
              <Route path="projects">
                <Route path=":projectId" element={<Project />} />
              </Route>
              <Route path="users">
                <Route index={true} element={<Users />} />
                <Route path=":userId" element={<User />} />
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
