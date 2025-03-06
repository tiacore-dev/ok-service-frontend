import { useDispatch } from "react-redux";
import axios from "axios";
import { useAuthToken } from "./useAuth";
import { authlogout, refreshToken } from "../store/modules/auth";

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export const useApi = () => {
  const dispatch = useDispatch();
  const tokens = useAuthToken();

  const apiPatch = async <R, D = any>(
    templateName: string,
    intityId: string,
    methodName: string,
    data?: D,
  ): Promise<R> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokens) {
      headers["Authorization"] = `Bearer ${tokens.access_token}`;
    }
    const url = `${process.env.REACT_APP_API_URL}/${templateName}/${intityId}/${methodName}`;
    let response = await axios.patch(url, JSON.stringify(data), {
      withCredentials: false,
      headers,
    });

    if (response.status === 401) {
      const newToken = await axios
        .post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refresh_token: tokens.refresh_token },
          { withCredentials: false, headers },
        )
        .catch((err) => {
          return err.response;
        });

      if (newToken.status !== 200) {
        dispatch(authlogout());
      }

      dispatch(
        refreshToken({
          access_token: newToken.data.access_token,
          refresh_token: newToken.data.refresh_token,
        }),
      );
      headers["Authorization"] = `Bearer ${newToken.data.access_token}`;

      response = await axios.patch(url, JSON.stringify(data), {
        withCredentials: false,
        headers,
      });
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.statusText);
    }
    return response.data;
  };

  const apiDelete = async <R, D = any>(
    templateName: string,
    intityId: string,
    methodName: string,
  ): Promise<R> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokens) {
      headers["Authorization"] = `Bearer ${tokens.access_token}`;
    }
    const url = `${process.env.REACT_APP_API_URL}/${templateName}/${intityId}/${methodName}`;
    let response = await axios.delete(url, {
      withCredentials: false,
      headers,
    });

    if (response.status === 401) {
      const newToken = await axios
        .post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refresh_token: tokens.refresh_token },
          { withCredentials: false, headers },
        )
        .catch((err) => {
          return err.response;
        });

      if (newToken.status !== 200) {
        dispatch(authlogout());
      }

      dispatch(
        refreshToken({
          access_token: newToken.data.access_token,
          refresh_token: newToken.data.refresh_token,
        }),
      );
      headers["Authorization"] = `Bearer ${newToken.data.access_token}`;

      response = await axios.delete(url, {
        withCredentials: false,
        headers,
      });
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.statusText);
    }
    return response.data;
  };

  const apiPost = async <R, D = any>(
    templateName: string,
    methodName: string,
    data?: D,
  ): Promise<R> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokens) {
      headers["Authorization"] = `Bearer ${tokens.access_token}`;
    }
    const url = `${process.env.REACT_APP_API_URL}/${templateName}/${methodName}`;
    let response = await axios.post(url, JSON.stringify(data), {
      withCredentials: false,
      headers,
    });

    if (response.status === 401) {
      const newToken = await axios
        .post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refresh_token: tokens.refresh_token },
          { withCredentials: false, headers },
        )
        .catch((err) => {
          return err.response;
        });

      if (newToken.status !== 200) {
        dispatch(authlogout());
      }

      dispatch(
        refreshToken({
          access_token: newToken.data.access_token,
          refresh_token: newToken.data.refresh_token,
        }),
      );
      headers["Authorization"] = `Bearer ${newToken.data.access_token}`;

      response = await axios.post(url, JSON.stringify(data), {
        withCredentials: false,
        headers,
      });
    }

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.statusText);
    }
    return response.data;
  };

  const apiGet = async <R>(
    templateName: string,
    methodName: string,
    access_token?: string,
    params?: Record<string, string | number>,
  ): Promise<R> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokens) {
      headers["Authorization"] =
        `Bearer ${access_token ?? tokens.access_token}`;
    }

    const url = `${process.env.REACT_APP_API_URL}/${templateName}/${methodName}`;
    let response = await axios
      .get(url, {
        withCredentials: false,
        params,
        headers,
      })
      .catch((err) => {
        return err.response;
      });

    if (response.status === 401) {
      const newToken = await axios
        .post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refresh_token: tokens.refresh_token },
          { withCredentials: false, headers },
        )
        .catch((err) => {
          return err.response;
        });

      if (newToken.status !== 200) {
        dispatch(authlogout());
      }

      dispatch(
        refreshToken({
          access_token: newToken.data.access_token,
          refresh_token: newToken.data.refresh_token,
        }),
      );
      headers["Authorization"] = `Bearer ${newToken.data.access_token}`;

      response = await axios.get(url, { withCredentials: false, headers });
    }

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  };

  return { apiPost, apiGet, apiPatch, apiDelete };
};
