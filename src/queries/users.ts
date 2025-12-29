import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  fetchUser,
  fetchUsers,
  hardDeleteUser,
  restoreUser,
  updateUser,
  type EditableUserPayload,
} from "../api/users.api";
import type { IUser } from "../interfaces/users/IUser";
import type { IUsersList } from "../interfaces/users/IUsersList";
import { createQueryKeys } from "../queryKeys";

export const usersKeys = createQueryKeys("users");

type UsersQueryOptions<TData> = Omit<
  UseQueryOptions<IUsersList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useUsersQuery = <TData = IUsersList[]>(
  options?: UsersQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: usersKeys.list(),
    queryFn: fetchUsers,
    ...options,
  });

type UserQueryOptions<TData> = Omit<
  UseQueryOptions<IUser, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useUserQuery = <TData = IUser>(
  userId: string | undefined,
  options?: UserQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(userId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: usersKeys.detail(userId ?? "unknown"),
    queryFn: () => fetchUser(userId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useUsersMap = (
  options?: UsersQueryOptions<IUsersList[]>,
): UseQueryResult<IUsersList[], Error> & {
  users: IUsersList[];
  usersMap: Record<string, IUser>;
} => {
  const query = useUsersQuery(options);
  const users = query.data ?? [];

  const usersMap = useMemo(() => {
    return users.reduce<Record<string, IUser>>((acc, user) => {
      acc[user.user_id] = user;
      return acc;
    }, {});
  }, [users]);

  return { ...query, users, usersMap };
};

export interface UpdateUserVariables {
  userId: string;
  payload: EditableUserPayload;
}

export const useCreateUserMutation = (): UseMutationResult<
  IUser,
  Error,
  EditableUserPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    },
  });
};

export const useUpdateUserMutation = (): UseMutationResult<
  IUser,
  Error,
  UpdateUserVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId),
      });
    },
  });
};

export const useDeleteUserMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
    },
  });
};

export const useRestoreUserMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => restoreUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
    },
  });
};

export const useHardDeleteUserMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => hardDeleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
    },
  });
};

export type { EditableUserPayload };
