import axios from "axios";
import { store } from "../store/appStore";
import { authlogout, refreshToken } from "../store/modules/auth";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchShiftReportDetails = async (
  params: Record<string, string>,
) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.get("/shift_report_details/all", {
      params: { ...params, sort_by: "created_at" },
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.get("/shift_report_details/all", {
        params: { ...params, sort_by: "created_at" },
        headers: {
          Authorization: `Bearer ${newTokenResponse.data.access_token}`,
        },
      });
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const createShiftReportDetailApi = async (data: any) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.post("/shift_report_details/add", data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.post("/shift_report_details/add", data, {
        headers: {
          Authorization: `Bearer ${newTokenResponse.data.access_token}`,
        },
      });
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const editShiftReportDetailApi = async (id: string, data: any) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.patch(
      `/shift_report_details/${id}/edit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.patch(
        `/shift_report_details/${id}/edit`,
        data,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const deleteShiftReportDetailApi = async (id: string) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.delete(
      `/shift_report_details/${id}/delete/hard`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.delete(
        `/shift_report_details/${id}/delete/hard`,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
