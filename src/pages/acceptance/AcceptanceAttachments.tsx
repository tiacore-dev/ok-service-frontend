import {
  DeleteTwoTone,
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Alert, Button, Image, Modal, Spin, Typography, Upload } from "antd";
import * as React from "react";
import { ActionDialog } from "../../components/ActionDialogs/ActionDialog";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IAttachment } from "../../interfaces/attachments/IAttachment";
import {
  useAcceptanceAttachmentsQuery,
  useDeleteAcceptanceAttachmentMutation,
  useDownloadAcceptanceAttachmentMutation,
  useUploadAcceptanceAttachmentsMutation,
} from "../../queries/acceptanceAttachments";

interface Props {
  acceptanceId: string;
  canManage: boolean;
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
const isPdf = (name: string) => /\.pdf$/i.test(name);
const isText = (name: string) => /\.(txt|csv|json|xml|log|md)$/i.test(name);
const formatSize = (value: number) =>
  value < 1048576
    ? `${Math.round(value / 1024)} КБ`
    : `${(value / 1048576).toFixed(1)} МБ`;

export const AcceptanceAttachments = ({ acceptanceId, canManage }: Props) => {
  const notificationApi = React.useContext(NotificationContext);
  const {
    data: files = [],
    isPending,
    isError,
  } = useAcceptanceAttachmentsQuery(acceptanceId);
  const uploadMutation = useUploadAcceptanceAttachmentsMutation();
  const deleteMutation = useDeleteAcceptanceAttachmentMutation();
  const downloadMutation = useDownloadAcceptanceAttachmentMutation();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewName, setPreviewName] = React.useState("");
  const [textContent, setTextContent] = React.useState<string | null>(null);

  const closePreview = React.useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTextContent(null);
  }, [previewUrl]);

  const saveBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const download = async (file: IAttachment) => {
    try {
      const blob = await downloadMutation.mutateAsync({
        acceptanceId,
        attachmentId: file.attachment_id,
      });
      saveBlob(blob, file.name);
    } catch {
      notificationApi?.error({
        message: "Ошибка",
        description: "Не удалось скачать вложение",
      });
    }
  };

  const preview = async (file: IAttachment) => {
    try {
      const blob = await downloadMutation.mutateAsync({
        acceptanceId,
        attachmentId: file.attachment_id,
      });

      if (!isImage(file.name) && !isPdf(file.name) && !isText(file.name)) {
        saveBlob(blob, file.name);
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewName(file.name);
      setTextContent(isText(file.name) ? await blob.text() : null);
    } catch {
      notificationApi?.error({
        message: "Ошибка",
        description: "Не удалось открыть предпросмотр",
      });
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    try {
      await uploadMutation.mutateAsync({
        acceptanceId,
        files: filesToUpload,
      });
      notificationApi?.success({
        message: "Успешно",
        description: "Вложения добавлены",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const message = (error as { response?: { data?: { msg?: string } } })
        ?.response?.data?.msg;
      notificationApi?.error({
        message: "Ошибка",
        description: message ?? "Не удалось добавить вложения",
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  return (
    <section className="acceptance__attachments">
      <div className="acceptance__section-header">
        <Typography.Title level={4} className="acceptance__section-title">
          Вложения
        </Typography.Title>
        {canManage && (
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={(file, fileList) => {
              if (fileList[0] === file) void uploadFiles(fileList);
              return false;
            }}
          >
            <Button icon={<PlusOutlined />}>Добавить вложение</Button>
          </Upload>
        )}
      </div>
      {isPending ? (
        <Spin />
      ) : isError ? (
        <Alert type="error" message="Не удалось загрузить вложения" />
      ) : files.length === 0 ? (
        <Typography.Text type="secondary">Вложений нет</Typography.Text>
      ) : (
        <div className="acceptance__attachments-list">
          {files.map((file) => (
            <div
              className="acceptance__attachment-item"
              key={file.attachment_id}
            >
              <Button
                className="acceptance__attachment-main"
                type="link"
                onClick={() => void preview(file)}
                icon={
                  isImage(file.name) ? (
                    <FileImageOutlined />
                  ) : (
                    <FileTextOutlined />
                  )
                }
              >
                <span className="acceptance__attachment-name">{file.name}</span>
                <span className="acceptance__attachment-size">
                  {formatSize(file.file_size)}
                </span>
              </Button>
              <div className="acceptance__attachment-actions">
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => void download(file)}
                />
                {canManage && (
                  <ActionDialog
                    buttonText=""
                    buttonType="link"
                    buttonIcon={<DeleteTwoTone twoToneColor="#e40808" />}
                    popoverText="Удалить вложение"
                    modalTitle={`Подтвердите удаление вложения ${file.name}`}
                    modalText={
                      <p>
                        Вы уверены, что хотите удалить вложение {file.name}?
                      </p>
                    }
                    onConfirm={() =>
                      deleteMutation.mutateAsync({
                        acceptanceId,
                        attachmentId: file.attachment_id,
                      })
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={Boolean(previewUrl) && !isImage(previewName)}
        title={previewName}
        width={isPdf(previewName) ? "90vw" : undefined}
        footer={null}
        onCancel={closePreview}
      >
        {textContent !== null ? (
          <pre className="acceptance__attachment-text-preview">
            {textContent}
          </pre>
        ) : isPdf(previewName) ? (
          <div className="acceptance__attachment-pdf-preview">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={previewUrl ?? ""} />
            </Worker>
          </div>
        ) : null}
      </Modal>
      <Image
        src={previewUrl ?? undefined}
        style={{ display: "none" }}
        preview={{
          visible: Boolean(previewUrl) && isImage(previewName),
          onVisibleChange: (visible) => {
            if (!visible) closePreview();
          },
        }}
      />
    </section>
  );
};
