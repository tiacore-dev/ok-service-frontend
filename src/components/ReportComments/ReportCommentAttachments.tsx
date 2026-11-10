import {
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button, Image, Modal, Spin, Typography, Upload } from "antd";
import * as React from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import type {
  IReportComment,
  IReportCommentAttachment,
  ReportCommentKind,
} from "../../interfaces/report-comments/IReportComment";
import {
  useDownloadReportCommentAttachmentMutation,
  useUploadReportCommentAttachmentsMutation,
} from "../../queries/reportComments";

interface ReportCommentAttachmentsProps {
  kind: ReportCommentKind;
  comment: IReportComment;
  canUpload?: boolean;
}

const isImage = (file: IReportCommentAttachment) =>
  /^image\//i.test(String(file.meta.content_type ?? "")) ||
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);

const isPdf = (file: IReportCommentAttachment) =>
  String(file.meta.content_type ?? "").toLowerCase() === "application/pdf" ||
  /\.pdf$/i.test(file.name);

const formatSize = (value: number) =>
  value < 1048576
    ? `${Math.max(1, Math.round(value / 1024))} КБ`
    : `${(value / 1048576).toFixed(1)} МБ`;

const getCommentId = (comment: IReportComment) =>
  comment.shift_report_comment_id ?? comment.acceptance_comment_id;

export const ReportCommentAttachments = ({
  kind,
  comment,
  canUpload = false,
}: ReportCommentAttachmentsProps) => {
  const notificationApi = React.useContext(NotificationContext);
  const uploadMutation = useUploadReportCommentAttachmentsMutation();
  const downloadMutation = useDownloadReportCommentAttachmentMutation();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFile, setPreviewFile] =
    React.useState<IReportCommentAttachment | null>(null);
  const commentId = getCommentId(comment);

  const closePreview = React.useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
  }, [previewUrl]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const download = async (file: IReportCommentAttachment) => {
    if (!commentId) return;

    try {
      const blob = await downloadMutation.mutateAsync({
        kind,
        commentId,
        attachmentId: file.attachment_id,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      return;
    }
  };

  const preview = async (file: IReportCommentAttachment) => {
    if (!commentId) return;

    if (!isImage(file) && !isPdf(file)) {
      await download(file);
      return;
    }

    try {
      const blob = await downloadMutation.mutateAsync({
        kind,
        commentId,
        attachmentId: file.attachment_id,
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewFile(file);
    } catch {
      return;
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!commentId) return;
    try {
      await uploadMutation.mutateAsync({ kind, commentId, files });
      notificationApi?.success({
        message: "Успешно",
        description: "Файлы комментария добавлены",
        placement: "bottomRight",
        duration: 2,
      });
    } catch {
      return;
    }
  };

  if (comment.attachments.length === 0 && !canUpload) return null;

  return (
    <div className="report-comments__attachments">
      <div className="report-comments__attachments-header">
        {canUpload && commentId && (
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={(file, fileList) => {
              if (fileList[0] === file) void uploadFiles(fileList);
              return false;
            }}
          >
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              loading={uploadMutation.isPending}
            ></Button>
          </Upload>
        )}
      </div>
      {uploadMutation.isPending && <Spin size="small" />}
      {comment.attachments.map((file) => (
        <div className="report-comments__attachment" key={file.attachment_id}>
          {isImage(file) || isPdf(file) ? (
            <Button
              type="link"
              icon={
                isImage(file) ? <FileImageOutlined /> : <FileTextOutlined />
              }
              onClick={() => void preview(file)}
            >
              {file.name} ({formatSize(file.file_size)})
            </Button>
          ) : (
            <Typography.Text>
              <FileTextOutlined /> {file.name} ({formatSize(file.file_size)})
            </Typography.Text>
          )}
          <Button
            type="link"
            icon={<DownloadOutlined />}
            aria-label={`Скачать ${file.name}`}
            onClick={() => void download(file)}
          />
        </div>
      ))}
      <Modal
        open={
          Boolean(previewUrl) && Boolean(previewFile) && !isImage(previewFile!)
        }
        title={previewFile?.name}
        width={previewFile && isPdf(previewFile) ? "90vw" : undefined}
        footer={null}
        onCancel={closePreview}
      >
        {previewFile && isPdf(previewFile) && (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={previewUrl ?? ""} />
          </Worker>
        )}
      </Modal>
      <Image
        src={previewUrl ?? undefined}
        style={{ display: "none" }}
        preview={{
          visible:
            Boolean(previewUrl) && Boolean(previewFile && isImage(previewFile)),
          onVisibleChange: (visible) => {
            if (!visible) closePreview();
          },
        }}
      />
    </div>
  );
};
