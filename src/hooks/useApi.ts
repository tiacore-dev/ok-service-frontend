import { apiClient } from "../api/base";

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export const useApi = () => {
  const apiPatch = async <R, D = any>(
    templateName: string,
    intityId: string,
    methodName: string,
    data?: D,
  ): Promise<R> => {
    const { data: responseData } = await apiClient.patch(
      `/${templateName}/${intityId}/${methodName}`,
      data,
    );
    return responseData;
  };

  const apiDelete = async <R>(
    templateName: string,
    intityId: string,
    methodName: string,
  ): Promise<R> => {
    const { data: responseData } = await apiClient.delete(
      `/${templateName}/${intityId}/${methodName}`,
    );
    return responseData;
  };

  const apiPost = async <R, D = any>(
    templateName: string,
    methodName: string,
    data?: D,
  ): Promise<R> => {
    const { data: responseData } = await apiClient.post(
      `/${templateName}/${methodName}`,
      data,
    );
    return responseData;
  };

  const apiGet = async <R>(
    templateName: string,
    methodName: string,
    access_token?: string,
    params?: Record<string, string | number>,
  ): Promise<R> => {
    const headers: Record<string, string> = {};
    if (access_token) {
      headers["Authorization"] = `Bearer ${access_token}`;
    }

    const { data: responseData } = await apiClient.get(
      `/${templateName}/${methodName}`,
      {
        params,
        headers: Object.keys(headers).length ? headers : undefined,
      },
    );
    return responseData;
  };

  return { apiPost, apiGet, apiPatch, apiDelete };
};
