import { useSelector } from "react-redux";
import { IState } from "../store/modules";
import { ITokens } from "./useApi";

export interface ILoginData {
  login: string;
  password: string;
}

export interface IauthToken {
  user_id: string;
  access_token: string;
}

export const useAuthData = () => {
  return useSelector((state: IState) => state.auth);
};

export const useAuthToken = (): ITokens => {
  const { access_token, refresh_token } = useAuthData();
  return { access_token, refresh_token };
};

// export const checkPermission = (permission: string): boolean => {
//   const { permissions } = authData();
//   if (!permissions) {
//     return false;
//   }
//   return Object.values(permissions).some((value) => value === permission);
// };
