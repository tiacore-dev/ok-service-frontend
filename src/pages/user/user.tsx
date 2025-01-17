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
import { IRole } from "../../interfaces/roles/IRole";
import { getRoles } from "../../store/modules/dictionaries/selectors/roles.selector";
import { DeleteUserDialog } from "../../components/ActionDialogs/DeleteUserDialog";

export const User = () => {
  const { Content } = Layout;
  const rolesMap = useSelector(getRoles);
  const routeParams = useParams();
  const { getUser, deleteUser } = useUsers();

  React.useEffect(() => {
    getUser(routeParams.userId);
  }, []);

  const userData = useSelector((state: IState) => state.pages.user.data);
  const isLoaded = useSelector((state: IState) => state.pages.user.loaded);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: "Главная" },
          {
            title: "Пользователи",
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
            <EditableUserDialog user={userData} />
            <DeleteUserDialog
              onDelete={() => {
                deleteUser(userData.user_id);
              }}
              name={userData.name}
            />
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Имя: {userData.name}</p>
            <p>ID: {userData.user_id}</p>
            <p>Логин: {userData.login}</p>
            <p>
              Роль:{" "}
              {
                rolesMap.find((item: IRole) => item.role_id === userData.role)
                  .name
              }
            </p>
          </Card>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
