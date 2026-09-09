import * as React from "react";
import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, InputNumber, Space } from "antd";
import type {
  EditableWorkPlanPayload,
  IWorkPlan,
} from "../../interfaces/workPlans/IWorkPlan";
import { formatNumber } from "../../utils/formatNumber";

export interface IWorkPlanProgress {
  completedSumm: number | null;
  acceptedSumm: number | null;
}

interface Props {
  cellKey: string;
  editing: boolean;
  plan?: IWorkPlan;
  canEdit: boolean;
  onEditStart: (cellKey: string) => void;
  onEditEnd: () => void;
  onSave: (
    plan: IWorkPlan | undefined,
    payload: EditableWorkPlanPayload,
  ) => Promise<void>;
  onDelete: (plan: IWorkPlan) => Promise<void>;
  payload: EditableWorkPlanPayload;
  progress?: IWorkPlanProgress;
  progressPending: boolean;
}

export const WorkPlanCell = React.memo(
  ({
    cellKey,
    editing,
    plan,
    canEdit,
    onEditStart,
    onEditEnd,
    onSave,
    onDelete,
    payload,
    progress,
    progressPending,
  }: Props) => {
    const [value, setValue] = React.useState<number | null>(null);
    const [saving, setSaving] = React.useState(false);
    const displayedValue = plan ? Number(plan.summ) : undefined;

    const cancel = () => {
      setValue(null);
      onEditEnd();
    };

    const save = async () => {
      setSaving(true);
      try {
        if (value === null) {
          if (plan) await onDelete(plan);
        } else {
          await onSave(plan, { ...payload, summ: String(value) });
        }
        cancel();
      } finally {
        setSaving(false);
      }
    };

    if (editing) {
      return (
        <Space size={2} className="work-plans__editor">
          <InputNumber
            value={value}
            min={0}
            precision={2}
            controls={false}
            autoFocus
            className="work-plans__input"
            onChange={(nextValue) =>
              setValue(typeof nextValue === "number" ? nextValue : null)
            }
            disabled={saving}
          />
          <Button
            size="small"
            type="text"
            icon={<CheckOutlined />}
            aria-label="Сохранить"
            onClick={save}
            loading={saving}
          />
          <Button
            size="small"
            type="text"
            icon={<CloseOutlined />}
            aria-label="Отменить"
            onClick={cancel}
            disabled={saving}
          />
        </Space>
      );
    }

    const completionPercent =
      displayedValue && displayedValue > 0 && progress
        ? (Number(progress.completedSumm ?? 0) / displayedValue) * 100
        : null;

    return (
      <div className="work-plans__cell">
        <span className="work-plans__cell-value">
          {displayedValue === undefined ? "—" : formatNumber(displayedValue)}
          {canEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="work-plans__edit-button"
              aria-label="Редактировать"
              onClick={() => {
                setValue(displayedValue ?? null);
                onEditStart(cellKey);
              }}
            />
          )}
        </span>
        {progressPending ? (
          <span className="work-plans__progress">Загрузка…</span>
        ) : progress ? (
          <span className="work-plans__progress">
            <span>
              {formatNumber(progress.completedSumm ?? 0)}
              {completionPercent !== null && (
                <> · {completionPercent.toFixed(1)}%</>
              )}
            </span>
            {progress.acceptedSumm != null && (
              <span>Принято: {formatNumber(progress.acceptedSumm)}</span>
            )}
          </span>
        ) : null}
      </div>
    );
  },
);
