import { Breadcrumb, Layout, Table } from "antd";
import * as React from "react";
import { usersDesktopColumns } from "./components/desktop.columns";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./users.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { usersMobileColumns } from "./components/mobile.columns";
import { minPageHeight } from "../../utils/pageSettings";
import { IUsersListColumn } from "../../interfaces/users/IUsersList";
import { useUsers } from "../../hooks/ApiActions/users";
import { getRolesMap } from "../../store/modules/dictionaries/selectors/roles.selector";

export const Users = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const filters = useSelector(
    (state: IState) => state.settings.usersSettings.filters
  );

  const { getUsers } = useUsers();

  React.useEffect(() => {
    getUsers();
  }, [filters]);

  const usersData: IUsersListColumn[] = useSelector(
    (state: IState) => state.pages.users.data
  ).map((doc) => ({ ...doc, key: doc.user_id }));

  const isLoading = useSelector((state: IState) => state.pages.users.loading);
  const rolesMap = useSelector(getRolesMap);

  const columns = React.useMemo(
    () =>
      isMobile()
        ? usersMobileColumns(navigate, rolesMap)
        : usersDesktopColumns(navigate, rolesMap),
    [navigate]
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[{ title: "Главная" }, { title: "Пользователи" }]}
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
        <Table dataSource={usersData} columns={columns} loading={isLoading} />
      </Content>
    </>
  );
};
