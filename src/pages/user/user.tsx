import * as React from "react";
import { Breadcrumb, Card, Layout, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useUsers } from "../../hooks/ApiActions/users";
import { EditableUserDialog } from "../../components/ActionDialogs/EditableUserDialog/EditableUserDialog";
import {
  getRolesMap,
} from "../../store/modules/dictionaries/selectors/roles.selector";
import { DeleteUserDialog } from "../../components/ActionDialogs/DeleteUserDialog";
import { Link } from "react-router-dom";
import { clearUserState } from "../../store/modules/pages/user.state";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const User = () => {
  const dispatch = useDispatch();

  const { Content } = Layout;
  const rolesMap = useSelector(getRolesMap);
  const routeParams = useParams();
  const { getUser, deleteUser } = useUsers();
  const currentRole = useSelector(getCurrentRole)

  React.useEffect(() => {
    getUser(routeParams.userId);

    return () => {
      dispatch(clearUserState())
    }
  }, []);

  const userData = useSelector((state: IState) => state.pages.user.data);
  const isLoaded = useSelector((state: IState) => state.pages.user.loaded);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/users">Пользователи</Link>,
          },
          { title: userData?.name },
        ]}
      />
      {isLoaded && userData && routeParams.userId === userData.user_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{userData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole === RoleId.ADMIN && <EditableUserDialog user={userData} />}
            {currentRole === RoleId.ADMIN && <DeleteUserDialog
              onDelete={() => {
                deleteUser(userData.user_id);
              }}
              name={userData.name}
            />}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Имя: {userData.name}</p>
            <p>Разряд: {userData.category ?? "Нет разряда"}</p>
            <p>ID: {userData.user_id}</p>
            <p>Логин: {userData.login}</p>
            <p>Роль: {rolesMap[userData.role]?.name}</p>
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
