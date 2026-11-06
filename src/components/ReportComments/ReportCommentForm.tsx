import { Button, Input, Space, Upload, Typography } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import * as React from "react";
import {
  useCreateReportCommentMutation,
  useEditReportCommentMutation,
  useUploadReportCommentAttachmentsMutation,
} from "../../queries/reportComments";
import type {
  IReportComment,
  ReportCommentKind,
} from "../../interfaces/report-comments/IReportComment";

export interface ReportCommentFormProps {
  kind: ReportCommentKind;
  parentId: string;
  comment?: IReportComment;
  onSaved?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const getCommentId = (comment: IReportComment) =>
  comment.shift_report_comment_id ?? comment.acceptance_comment_id;

export const ReportCommentForm = ({
  kind,
  parentId,
  comment,
  onSaved,
  onCancel,
  disabled = false,
}: ReportCommentFormProps) => {
  const [text, setText] = React.useState(comment?.text ?? "");
  const createMutation = useCreateReportCommentMutation();
  const editMutation = useEditReportCommentMutation();
  const uploadMutation = useUploadReportCommentAttachmentsMutation();
  const [files, setFiles] = React.useState<File[]>([]);
  const isEditing = Boolean(comment);
  const isPending = createMutation.isPending || editMutation.isPending;

  React.useEffect(() => {
    setText(comment?.text ?? "");
  }, [comment]);

  const save = async () => {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    let savedComment: IReportComment;
    if (isEditing && comment) {
      const commentId = getCommentId(comment);
      if (!commentId) return;

      savedComment = await editMutation.mutateAsync({
        kind,
        commentId,
        text: normalizedText,
      });
    } else {
      savedComment = await createMutation.mutateAsync({
        kind,
        parentId,
        text: normalizedText,
      });
    }

    const commentId =
      savedComment.shift_report_comment_id ??
      savedComment.acceptance_comment_id;
    if (commentId && files.length > 0) {
      await uploadMutation.mutateAsync({ kind, commentId, files });
    }

    setText("");
    setFiles([]);
    onSaved?.();
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Input.TextArea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Напишите комментарий"
        autoSize={{ minRows: 3, maxRows: 8 }}
        disabled={isPending || disabled}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Upload
          multiple
          showUploadList={{ showRemoveIcon: !isPending }}
          beforeUpload={() => false}
          fileList={files.map((file) => ({
            uid: `${file.name}-${file.lastModified}`,
            name: file.name,
            status: "done" as const,
          }))}
          onChange={({ fileList }) =>
            setFiles(
              fileList
                .map((file) => file.originFileObj)
                .filter(Boolean) as File[],
            )
          }
        >
          <Button icon={<PaperClipOutlined />} disabled={isPending || disabled}>
            Прикрепить файлы
          </Button>
        </Upload>
        <Space>
          <Button
            type="primary"
            onClick={() => void save()}
            loading={isPending || uploadMutation.isPending}
            disabled={!text.trim() || disabled}
          >
            {isEditing ? "Сохранить" : "Добавить комментарий"}
          </Button>
          {isEditing && (
            <Button onClick={onCancel} disabled={isPending || disabled}>
              Отмена
            </Button>
          )}
        </Space>
      </div>
      {files.length > 0 && (
        <Typography.Text type="secondary">
          Выбрано файлов: {files.length}
        </Typography.Text>
      )}
    </Space>
  );
};
