import axios from "axios";
import { store } from "../store/appStore";
import { authlogout, refreshToken } from "../store/modules/auth";
import type { IShiftReportMaterial } from "../interfaces/shiftReportMaterials/IShiftReportMaterial";
import type { IShiftReportMaterialsList } from "../interfaces/shiftReportMaterials/IShiftReportMaterialsList";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface EditableShiftReportMaterialPayload
  extends Omit<
    IShiftReportMaterial,
    "shift_report_material_id" | "created_at" | "created_by"
  > {}

export const fetchShiftReportMaterials = async (
  params: Record<string, string>,
): Promise<{ shift_report_materials: IShiftReportMaterialsList[] }> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.get("/shift_report_materials/all", {
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

      response = await axiosInstance.get("/shift_report_materials/all", {
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

export const createShiftReportMaterialApi = async (
  data: EditableShiftReportMaterialPayload,
): Promise<IShiftReportMaterial> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.post(
      "/shift_report_materials/add",
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

      response = await axiosInstance.post("/shift_report_materials/add", data, {
        headers: {
          Authorization: `Bearer ${newTokenResponse.data.access_token}`,
        },
      });
    }

    return response.data.shift_report_material ?? response.data;
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

export const editShiftReportMaterialApi = async (
  id: string,
  data: EditableShiftReportMaterialPayload,
): Promise<IShiftReportMaterial> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.patch(
      `/shift_report_materials/${id}/edit`,
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
        `/shift_report_materials/${id}/edit`,
        data,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data.shift_report_material ?? response.data;
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

export const deleteShiftReportMaterialApi = async (
  id: string,
): Promise<void> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.delete(
      `/shift_report_materials/${id}/delete/hard`,
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
        `/shift_report_materials/${id}/delete/hard`,
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
