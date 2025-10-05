import * as React from "react";
import { Button, Form, Input, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { ILoginData } from "../../../hooks/useAuth";
import { authlogin } from "../../../store/modules/auth";
import Title from "antd/es/typography/Title";
import { IUser } from "../../../interfaces/users/IUser";
import { useloadSourse } from "../../../components/App/App";

interface IAuthLoginResponse {
  access_token: string;
  refresh_token: string;
  msg: string;
  user_id: string;
}

export const Login = () => {
  const dispatch = useDispatch();
  const { load } = useloadSourse();
  const navigate = useNavigate();
  const { apiPost, apiGet } = useApi();
  const [messageApi, contextHolder] = message.useMessage();
  const login = React.useCallback(
    async (loginData: ILoginData) => {
      try {
        const authLoginResponse = await apiPost<IAuthLoginResponse, ILoginData>(
          "auth",
          "login",
          loginData,
        );

        const { user: userData } = await apiGet<{
          user: IUser;
        }>(
          "users",
          `${authLoginResponse.user_id}/view`,
          authLoginResponse.access_token,
        );

        dispatch(
          authlogin({
            user_id: authLoginResponse.user_id,
            access_token: authLoginResponse.access_token,
            refresh_token: authLoginResponse.refresh_token,
            name: userData.name,
            category: userData.category,
            login: userData.login,
            role: userData.role,
            deleted: userData.deleted,
          }),
        );
        load(authLoginResponse.access_token);
        navigate("/home");
      } catch (err) {
        const errorMessage = err?.message || String(err);
        messageApi.error(errorMessage);
      }
    },
    [apiPost, apiGet, dispatch, navigate, messageApi],
  );
  return (
    <>
      {contextHolder}

      <Title
        style={{
          marginTop: "40px",
          textAlign: "center",
        }}
      >
        Огнезащитная Корпорация
      </Title>
      <Form
        name="login"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={login}
        autoComplete="off"
        style={{
          width: "380px",
          margin: "40px auto",
        }}
      >
        <Form.Item
          label="Login"
          name="login"
          rules={[{ required: true, message: "Please input your login!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              Вход
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};
