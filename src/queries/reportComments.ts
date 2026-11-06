import { notification } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import {
  createReportComment,
  deleteReportComment,
  downloadReportCommentAttachment,
  editReportComment,
  fetchReportComments,
  uploadReportCommentAttachments,
} from "../api/report-comments.api";
import type {
  ICreateReportCommentVariables,
  ReportCommentKind,
} from "../interfaces/report-comments/IReportComment";

export const reportCommentsKeys = createQueryKeys("reportComments");

const reportCommentsQueryKey = (kind: ReportCommentKind, parentId: string) =>
  reportCommentsKeys.detail(`${kind}:${parentId}`);

const showCommentError = (error: unknown, fallback: string) => {
  notification.error({
    message: "Ошибка комментария",
    description: getApiErrorMessage(error, fallback),
  });
};

export const useReportCommentsQuery = (
  kind: ReportCommentKind,
  parentId: string,
) =>
  useQuery({
    queryKey: reportCommentsQueryKey(kind, parentId),
    queryFn: () => fetchReportComments({ kind, parentId }),
    enabled: Boolean(parentId),
  });

export const useCreateReportCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReportComment,
    onSuccess: (_, variables: ICreateReportCommentVariables) =>
      queryClient.invalidateQueries({
        queryKey: reportCommentsQueryKey(variables.kind, variables.parentId),
      }),
    onError: (error) =>
      showCommentError(error, "Не удалось создать комментарий"),
  });
};

export const useEditReportCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editReportComment,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: reportCommentsKeys.all(),
      }),
    onError: (error) =>
      showCommentError(error, "Не удалось изменить комментарий"),
  });
};

export const useDeleteReportCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReportComment,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: reportCommentsKeys.all(),
      }),
    onError: (error) =>
      showCommentError(error, "Не удалось удалить комментарий"),
  });
};

export const useUploadReportCommentAttachmentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadReportCommentAttachments,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: reportCommentsKeys.all(),
      }),
    onError: (error) =>
      showCommentError(error, "Не удалось загрузить файл комментария"),
  });
};

export const useDownloadReportCommentAttachmentMutation = () =>
  useMutation({
    mutationFn: downloadReportCommentAttachment,
    onError: (error) =>
      showCommentError(error, "Не удалось скачать файл комментария"),
  });
