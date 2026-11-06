export type ReportCommentKind = "shift" | "acceptance";

export interface IReportCommentAttachment {
  attachment_id: string;
  name: string;
  file_size: number;
  checksum: string;
  meta: Record<string, unknown>;
  created_at: number;
  created_by: string;
}

export interface IReportComment {
  shift_report_comment_id?: string;
  acceptance_comment_id?: string;
  text: string;
  created_by: string;
  author_name?: string;
  created_at: number;
  updated_at?: number;
  browser_id?: string;
  attachments: IReportCommentAttachment[];
}

export interface IReportCommentList {
  total: number;
  comments: IReportComment[];
}

export interface ICreateReportCommentVariables {
  kind: ReportCommentKind;
  parentId: string;
  text: string;
}

export interface IEditReportCommentVariables {
  kind: ReportCommentKind;
  commentId: string;
  text: string;
}

export interface IDeleteReportCommentVariables {
  kind: ReportCommentKind;
  commentId: string;
}

export interface IUploadReportCommentAttachmentsVariables {
  kind: ReportCommentKind;
  commentId: string;
  files: File[];
}

export interface IDownloadReportCommentAttachmentVariables {
  kind: ReportCommentKind;
  commentId: string;
  attachmentId: string;
}
