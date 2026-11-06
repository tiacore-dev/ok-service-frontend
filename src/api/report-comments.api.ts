import { apiClient } from "./base";
import type {
  IDownloadReportCommentAttachmentVariables,
  IReportComment,
  IReportCommentList,
  IUploadReportCommentAttachmentsVariables,
  ReportCommentKind,
} from "../interfaces/report-comments/IReportComment";

const getBasePath = (kind: ReportCommentKind) =>
  kind === "shift" ? "/shift_reports" : "/acceptances";

const getCommentPath = (kind: ReportCommentKind, commentId: string) =>
  kind === "shift"
    ? `/shift_reports/comments/${commentId}`
    : `/acceptances/comments/${commentId}`;

export const fetchReportComments = async ({
  kind,
  parentId,
}: {
  kind: ReportCommentKind;
  parentId: string;
}): Promise<IReportCommentList> => {
  const { data } = await apiClient.get<IReportCommentList>(
    `${getBasePath(kind)}/${parentId}/comments`,
    { params: { offset: 0, limit: 100 } },
  );

  return data;
};

export const createReportComment = async ({
  kind,
  parentId,
  text,
}: {
  kind: ReportCommentKind;
  parentId: string;
  text: string;
}): Promise<IReportComment> => {
  const { data } = await apiClient.post<IReportComment>(
    `${getBasePath(kind)}/${parentId}/comments`,
    { text },
  );

  return data;
};

export const editReportComment = async ({
  kind,
  commentId,
  text,
}: {
  kind: ReportCommentKind;
  commentId: string;
  text: string;
}): Promise<IReportComment> => {
  const { data } = await apiClient.patch<IReportComment>(
    getCommentPath(kind, commentId),
    { text },
  );

  return data;
};

export const deleteReportComment = ({
  kind,
  commentId,
}: {
  kind: ReportCommentKind;
  commentId: string;
}) => apiClient.delete(getCommentPath(kind, commentId));

export const uploadReportCommentAttachments = async ({
  kind,
  commentId,
  files,
}: IUploadReportCommentAttachmentsVariables): Promise<IReportComment> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await apiClient.post<IReportComment>(
    `${getCommentPath(kind, commentId)}/attachments`,
    formData,
  );

  return data;
};

export const downloadReportCommentAttachment = async ({
  kind,
  commentId,
  attachmentId,
}: IDownloadReportCommentAttachmentVariables): Promise<Blob> => {
  const response = await apiClient.get(
    `${getCommentPath(kind, commentId)}/attachments/${attachmentId}/download`,
    { responseType: "blob" },
  );

  return response.data as Blob;
};
