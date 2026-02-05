import { apiClient } from "./base";
import type { IUser } from "../interfaces/users/IUser";
import type { IUsersList } from "../interfaces/users/IUsersList";

export interface EditableUserPayload extends Omit<IUser, "user_id"> {
  password?: string;
}

export const fetchUsers = async (): Promise<IUsersList[]> => {
  const { data } = await apiClient.get<{ users: IUsersList[] }>("/users/all");
  return data.users;
};

export const fetchUser = async (userId: string): Promise<IUser> => {
  const { data } = await apiClient.get<{ user: IUser }>(
    `/users/${userId}/view`,
  );
  return data.user;
};

export const createUser = async (
  payload: EditableUserPayload,
): Promise<IUser> => {
  const { data } = await apiClient.post<{ user: IUser }>("/users/add", payload);
  return data.user;
};

export const updateUser = async (
  userId: string,
  payload: EditableUserPayload,
): Promise<IUser> => {
  const { data } = await apiClient.patch<{ user: IUser }>(
    `/users/${userId}/edit`,
    payload,
  );
  return data.user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.patch(`/users/${userId}/delete/soft`);
};

export const restoreUser = async (userId: string): Promise<void> => {
  await apiClient.patch(`/users/${userId}/restore`);
};

export const hardDeleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}/delete/hard`);
};
