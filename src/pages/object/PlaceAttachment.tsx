import {
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteTwoTone,
} from "@ant-design/icons";
import { Alert, Button, Image, Modal, Spin, Upload } from "antd";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import React from "react";
import { ActionDialog } from "../../components/ActionDialogs/ActionDialog";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IAttachment } from "../../interfaces/attachments/IAttachment";
import {
  useDeletePlaceAttachmentMutation,
  useDownloadPlaceAttachmentMutation,
  usePlaceAttachmentsQuery,
  useUploadPlaceAttachmentMutation,
} from "../../queries/placeAttachments";

interface PlaceAttachmentProps {
  placeId: string;
  canManage: boolean;
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
const isPdf = (name: string) => /\.pdf$/i.test(name);
const isText = (name: string) => /\.(txt|csv|json|xml|log|md)$/i.test(name);
const formatSize = (value: number) =>
  value < 1048576
    ? `${Math.round(value / 1024)} КБ`
    : `${(value / 1048576).toFixed(1)} МБ`;

const saveFile = (file: Blob, name: string) => {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const PlaceAttachment = ({
  placeId,
  canManage,
}: PlaceAttachmentProps) => {
  const notification = React.useContext(NotificationContext);
  const attachmentsQuery = usePlaceAttachmentsQuery(placeId);
  const uploadMutation = useUploadPlaceAttachmentMutation();
  const deleteMutation = useDeletePlaceAttachmentMutation();
  const downloadMutation = useDownloadPlaceAttachmentMutation();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewName, setPreviewName] = React.useState("");
  const [textContent, setTextContent] = React.useState<string | null>(null);
  const attachment = attachmentsQuery.data?.[0];

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTextContent(null);
  };

  const download = async (file: IAttachment) => {
    try {
      const blob = await downloadMutation.mutateAsync({
        placeId,
        attachmentId: file.attachment_id,
      });
      saveFile(blob, file.name);
    } catch {
      notification?.error({
        message: "Ошибка",
        description: "Не удалось скачать вложение",
      });
    }
  };

  const preview = async (file: IAttachment) => {
    try {
      const blob = await downloadMutation.mutateAsync({
        placeId,
        attachmentId: file.attachment_id,
      });
      if (!isImage(file.name) && !isPdf(file.name) && !isText(file.name)) {
        saveFile(blob, file.name);
        return;
      }
      setPreviewName(file.name);
      setPreviewUrl(URL.createObjectURL(blob));
      setTextContent(isText(file.name) ? await blob.text() : null);
    } catch {
      notification?.error({
        message: "Ошибка",
        description: "Не удалось открыть предпросмотр",
      });
    }
  };

  const upload = async (file: File) => {
    try {
      await uploadMutation.mutateAsync({ placeId, file });
      notification?.success({
        message: "Успешно",
        description: "Вложение добавлено",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const message = (error as { response?: { data?: { msg?: string } } })
        .response?.data?.msg;
      notification?.error({
        message: "Ошибка",
        description: message ?? "Не удалось добавить вложение",
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  if (attachmentsQuery.isPending) return <Spin size="small" />;
  if (attachmentsQuery.isError)
    return <Alert type="error" message="Не удалось загрузить вложение" />;

  return (
    <div className="object-places__attachment">
      {attachment ? (
        <>
          <Button
            className="object-places__attachment-main"
            type="link"
            icon={
              isImage(attachment.name) ? (
                <FileImageOutlined />
              ) : (
                <FileTextOutlined />
              )
            }
            onClick={() => void preview(attachment)}
          >
            <span className="object-places__attachment-name">
              {attachment.name}
            </span>
            <span className="object-places__attachment-size">
              {formatSize(attachment.file_size)}
            </span>
          </Button>
          <div className="object-places__attachment-actions">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => void download(attachment)}
            />
            {canManage && (
              <ActionDialog
                buttonText=""
                buttonType="link"
                buttonIcon={<DeleteTwoTone twoToneColor="#e40808" />}
                popoverText="Удалить вложение"
                modalTitle={`Подтвердите удаление вложения ${attachment.name}`}
                modalText={
                  <p>
                    Вы уверены, что хотите удалить вложение {attachment.name}?
                  </p>
                }
                onConfirm={() =>
                  deleteMutation.mutateAsync({
                    placeId,
                    attachmentId: attachment.attachment_id,
                  })
                }
              />
            )}
          </div>
        </>
      ) : (
        canManage && (
          <Upload
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
              void upload(file);
              return false;
            }}
          >
            <Button
              type="link"
              style={{ padding: 0 }}
              icon={<PlusOutlined />}
              loading={uploadMutation.isPending}
            >
              Добавить вложение
            </Button>
          </Upload>
        )
      )}

      <Modal
        open={Boolean(previewUrl) && !isImage(previewName)}
        title={previewName}
        width={isPdf(previewName) ? "90vw" : undefined}
        footer={null}
        onCancel={closePreview}
      >
        {textContent !== null ? (
          <pre className="object-places__attachment-text-preview">
            {textContent}
          </pre>
        ) : isPdf(previewName) ? (
          <div className="object-places__attachment-pdf-preview">
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
    </div>
  );
};
