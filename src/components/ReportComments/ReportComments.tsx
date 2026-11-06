import {
  Alert,
  Avatar,
  Button,
  Empty,
  List,
  Modal,
  Spin,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import * as React from "react";
import { useReportCommentsQuery } from "../../queries/reportComments";
import type {
  IReportComment,
  ReportCommentKind,
} from "../../interfaces/report-comments/IReportComment";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ReportCommentAttachments } from "./ReportCommentAttachments";
import { ReportCommentForm } from "./ReportCommentForm";
import { useSelector } from "react-redux";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { useDeleteReportCommentMutation } from "../../queries/reportComments";
import "./ReportComments.less";

const formatCommentDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });

const getCommentKey = (comment: IReportComment) =>
  comment.shift_report_comment_id ??
  comment.acceptance_comment_id ??
  `${comment.created_at}-${comment.created_by}`;

const getInitials = (name?: string) =>
  (name || "П")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export interface ReportCommentsProps {
  kind: ReportCommentKind;
  parentId: string;
  title?: string;
  onEdit?: (comment: IReportComment) => void;
  editingComment?: IReportComment;
  onEditDone?: () => void;
}

export const ReportComments = ({
  kind,
  parentId,
  title = "Комментарии",
  onEdit,
  editingComment,
  onEditDone,
}: ReportCommentsProps) => {
  const { data, isLoading, isError, error } = useReportCommentsQuery(
    kind,
    parentId,
  );
  const currentUserId = useSelector(getCurrentUserId);
  const currentRole = useSelector(getCurrentRole);
  const deleteMutation = useDeleteReportCommentMutation();

  if (isLoading) {
    return (
      <section className="report-comments" aria-label={title}>
        {title && <Typography.Title level={4}>{title}</Typography.Title>}
        <Spin />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="report-comments" aria-label={title}>
        {title && <Typography.Title level={4}>{title}</Typography.Title>}
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            error,
            "Не удалось загрузить комментарии",
          )}
        />
      </section>
    );
  }

  const comments = data?.comments ?? [];

  return (
    <section className="report-comments" aria-label={title}>
      {title && <Typography.Title level={4}>{title}</Typography.Title>}
      {comments.length === 0 ? (
        <Empty description="Комментариев пока нет" />
      ) : (
        <List
          className="report-comments__list"
          dataSource={comments}
          itemLayout="vertical"
          renderItem={(comment) => (
            <List.Item key={getCommentKey(comment)}>
              <div className="report-comments__item">
                <Avatar size={32}>{getInitials(comment.author_name)}</Avatar>
                <div className="report-comments__body">
                  <div className="report-comments__meta">
                    <Typography.Text strong>
                      {comment.author_name || "Пользователь"}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {formatCommentDate(comment.created_at)}
                    </Typography.Text>
                  </div>
                  {editingComment &&
                  getCommentKey(editingComment) === getCommentKey(comment) ? (
                    <ReportCommentForm
                      kind={kind}
                      parentId={parentId}
                      comment={editingComment}
                      onSaved={onEditDone}
                      onCancel={onEditDone}
                    />
                  ) : (
                    <Typography.Paragraph className="report-comments__text">
                      {comment.text}
                    </Typography.Paragraph>
                  )}
                  {(!editingComment ||
                    getCommentKey(editingComment) !== getCommentKey(comment)) &&
                    (() => {
                      const commentId = getCommentKey(comment);
                      const canEdit =
                        comment.created_by === currentUserId &&
                        Date.now() - comment.created_at <= 5 * 60 * 1000;
                      const canDelete = currentRole === RoleId.ADMIN;
                      return (
                        <>
                          <ReportCommentAttachments
                            kind={kind}
                            comment={comment}
                            canUpload={canEdit}
                          />
                          {(canEdit || canDelete) && (
                            <div className="report-comments__actions">
                              {canEdit && (
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<EditOutlined />}
                                  aria-label="Изменить комментарий"
                                  onClick={() => onEdit?.(comment)}
                                />
                              )}
                              {canDelete && (
                                <Button
                                  type="link"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() =>
                                    Modal.confirm({
                                      title: "Удалить комментарий?",
                                      okText: "Удалить",
                                      cancelText: "Отмена",
                                      okButtonProps: { danger: true },
                                      onOk: () =>
                                        deleteMutation.mutate({
                                          kind,
                                          commentId,
                                        }),
                                    })
                                  }
                                />
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </section>
  );
};
