import { isAxiosError } from "axios";

interface ApiErrorResponse {
  msg?: unknown;
  message?: unknown;
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseData = error.response?.data;
    if (typeof responseData?.msg === "string") {
      return responseData.msg;
    }
    if (typeof responseData?.message === "string") {
      return responseData.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};
