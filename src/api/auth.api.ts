import { apiClient } from "./base";

/** Ends the current server-bound JWT session. The access token is attached by apiClient. */
export const logout = () => apiClient.post("/auth/logout");
