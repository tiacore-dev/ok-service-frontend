import { Space, Typography } from "antd";
import * as React from "react";
import type { ReportCommentKind } from "../../interfaces/report-comments/IReportComment";
import { ReportComments } from "./ReportComments";
import { ReportCommentForm } from "./ReportCommentForm";
import type { IReportComment } from "../../interfaces/report-comments/IReportComment";

interface Props {
  kind: ReportCommentKind;
  parentId: string;
  canCreate?: boolean;
}

export const ReportCommentsSection = ({
  kind,
  parentId,
  canCreate = false,
}: Props) => {
  const [editingComment, setEditingComment] = React.useState<IReportComment>();
  return (
    <section className="report-comments-section">
      <Typography.Title level={4} className="report-comments-section__title">
        Комментарии
      </Typography.Title>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <ReportComments
          kind={kind}
          parentId={parentId}
          title=""
          onEdit={setEditingComment}
          editingComment={editingComment}
          onEditDone={() => setEditingComment(undefined)}
        />
        {canCreate && (
          <ReportCommentForm
            kind={kind}
            parentId={parentId}
            comment={editingComment}
            onSaved={() => setEditingComment(undefined)}
            onCancel={() => setEditingComment(undefined)}
            disabled={Boolean(editingComment)}
          />
        )}
      </Space>
    </section>
  );
};
