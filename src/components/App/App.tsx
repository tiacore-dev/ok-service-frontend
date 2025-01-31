import * as React from "react";
import { Layout, notification } from "antd";
import { AppHeader } from "../AppHeader/AppHeader";
import { AppFooter } from "../AppFooter/AppFooter";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { IauthToken } from "../../hooks/useAuth";
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
import { NotificationContext } from "../../../root";
import {
  clearRolesState,
  getRolesFailure,
  getRolesRequest,
  getRolesSuccess,
} from "../../store/modules/dictionaries/roles";
import { IRole } from "../../interfaces/roles/IRole";
import { User } from "../../pages/user/user";
import { Object } from "../../pages/object/object";
import { Projects } from "../../pages/projects/projects.page";
import {
  clearObjectsState,
  getObjectsFailure,
  getObjectsRequest,
  getObjectsSuccess,
} from "../../store/modules/pages/objects.state";
import { IObject } from "../../interfaces/objects/IObject";
import { IObjectsList } from "../../interfaces/objects/IObjectsList";
import {
  clearUsersState,
  getUsersFailure,
  getUsersRequest,
  getUsersSuccess,
} from "../../store/modules/pages/users.state";
import { IUsersList } from "../../interfaces/users/IUsersList";
import { Project } from "../../pages/project/project";
import { Works } from "../../pages/works/works.page";
import { Work } from "../../pages/work/work";

export const useloadSourse = (): {
  load: (access_token?: string) => Promise<void>;
  clearStates: () => void;
} => {
  const clearStates = React.useCallback(() => {
    dispatch(clearObjectStatusesState());
    dispatch(clearRolesState());
    dispatch(clearObjectsState());
    dispatch(clearUsersState());
  }, []);
  const notificationApi = React.useContext(NotificationContext);
  const dispatch = useDispatch();
  const { apiGet } = useApi();

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
        access_token
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

    // Загрузка справочника объектов
    dispatch(getObjectsRequest());
    try {
      const response: { objects: IObjectsList[]; msg: string } = await apiGet(
        "objects",
        "all",
        access_token
      );

      dispatch(getObjectsSuccess(response.objects));
    } catch (err) {
      notificationApi.error({
        message: "Ошибка",
        description: "Ошибка при загрузке справочника объектов",
      });
      console.log("getObjectsFailure ", err);
      dispatch(getObjectsFailure(err));
    }

    // Загрузка справочника пользователей
    dispatch(getUsersRequest());
    try {
      const response: { users: IUsersList[]; msg: string } = await apiGet(
        "users",
        "all",
        access_token
      );

      dispatch(getUsersSuccess(response.users));
    } catch (err) {
      notificationApi.error({
        message: "Ошибка",
        description: "Ошибка при загрузке справочника статусов объектов",
      });
      console.log("getUsersFailure ", err);
      dispatch(getUsersFailure(err));
    }
  }, []);

  return { load, clearStates };
};

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = useSelector((state: IState) => state.auth);
  const isAuth = authData.isAuth;
  React.useEffect(() => {
    if (!isAuth && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuth, location]);

  const mobile = isMobile();

  const [api, contextHolder] = notification.useNotification();

  return (
    <>
      <Layout>
        {isAuth && !mobile && <AppHeader isMobile={mobile} />}

        <Layout
          style={{
            padding: mobile ? "0" : "0 24px",
            height: pageHeight(),
            overflowX: "auto",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Routes>
            <Route path="/">
              <Route index={true} element={<Main />} />
              <Route path="account" element={<Account />} />
              <Route path="login" element={<Login />} />
              <Route path="objects">
                <Route index={true} element={<Objects />} />
                <Route path=":objectId" element={<Object />} />
              </Route>
              <Route path="projects">
                <Route index={true} element={<Projects />} />
                <Route path=":projectId" element={<Project />} />
              </Route>
              <Route path="users">
                <Route index={true} element={<Users />} />
                <Route path=":userId" element={<User />} />
              </Route>
              <Route path="works">
                <Route index={true} element={<Works />} />
                <Route path=":workId" element={<Work />} />
              </Route>
              <Route path="shifts">
                <Route index={true} element={<Main />} />
                <Route path=":shiftId" element={<Main />} />
              </Route>

              <Route path="reports" element={<Main />} />
            </Route>
          </Routes>
        </Layout>

        {isAuth && <AppFooter />}
        {contextHolder}
      </Layout>
    </>
  );
};
