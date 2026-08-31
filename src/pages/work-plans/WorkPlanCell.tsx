import * as React from "react";
import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, InputNumber, Space } from "antd";
import type {
  EditableWorkPlanPayload,
  IWorkPlan,
} from "../../interfaces/workPlans/IWorkPlan";
import { formatNumber } from "../../utils/formatNumber";

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
  }: Props) => {
    const [value, setValue] = React.useState<number | null>(null);
    const [saving, setSaving] = React.useState(false);
    const displayedValue = plan ? Number(plan.summ) : undefined;

    if (!canEdit)
      return (
        <>{displayedValue === undefined ? "—" : formatNumber(displayedValue)}</>
      );

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

    return (
      <span className="work-plans__cell-value">
        {displayedValue === undefined ? "—" : formatNumber(displayedValue)}
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
      </span>
    );
  },
);
