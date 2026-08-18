import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Input,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
import { DeleteTwoTone, EditTwoTone, PlusOutlined } from "@ant-design/icons";
import React from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { usePlacesQuery } from "../../queries/places";
import { useProjectPlaceRelationsQuery } from "../../queries/projectPlaceRelations";
import {
  useAddShiftPlaceRelationsBulkMutation,
  useDeleteShiftPlaceRelationsBulkMutation,
  useEditShiftPlaceRelationMutation,
  useShiftPlaceRelationsQuery,
} from "../../queries/shiftPlaceRelations";

interface Props {
  shiftReportId: string;
  projectId: string;
  canEdit: boolean;
}
export const ShiftReportPlaces = ({
  shiftReportId,
  projectId,
  canEdit,
}: Props) => {
  const notification = React.useContext(NotificationContext);
  const placesQuery = usePlacesQuery();
  const projectRelationsQuery = useProjectPlaceRelationsQuery();
  const relationsQuery = useShiftPlaceRelationsQuery();
  const addMutation = useAddShiftPlaceRelationsBulkMutation();
  const deleteMutation = useDeleteShiftPlaceRelationsBulkMutation();
  const editMutation = useEditShiftPlaceRelationMutation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftIds, setDraftIds] = React.useState<string[]>([]);
  const [draftComments, setDraftComments] = React.useState<
    Record<string, string>
  >({});
  const relations = React.useMemo(
    () =>
      (relationsQuery.data ?? []).filter(
        (r) => r.shift_report_id === shiftReportId,
      ),
    [relationsQuery.data, shiftReportId],
  );
  const placesById = React.useMemo(
    () => new Map((placesQuery.data ?? []).map((p) => [p.place_id, p])),
    [placesQuery.data],
  );
  const availableIds = React.useMemo(
    () =>
      new Set(
        (projectRelationsQuery.data ?? [])
          .filter((r) => r.project_id === projectId)
          .map((r) => r.place_id),
      ),
    [projectRelationsQuery.data, projectId],
  );
  const options = React.useMemo(
    () =>
      (placesQuery.data ?? [])
        .filter((p) => availableIds.has(p.place_id) && !p.deleted)
        .map((p) => ({ label: p.name, value: p.place_id })),
    [placesQuery.data, availableIds],
  );
  const relationByPlace = React.useMemo(
    () => new Map(relations.map((r) => [r.place_id, r])),
    [relations],
  );
  const saving =
    addMutation.isPending || deleteMutation.isPending || editMutation.isPending;
  const openCreate = () => {
    setEditingId(null);
    setDraftIds(relations.map((relation) => relation.place_id));
    setDraftComments(
      Object.fromEntries(
        relations.map((relation) => [relation.place_id, relation.comment ?? ""]),
      ),
    );
    setModalOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setDraftIds([id]);
    setDraftComments({ [id]: relationByPlace.get(id)?.comment ?? "" });
    setModalOpen(true);
  };
  const save = async () => {
    try {
      if (editingId) {
        const r = relationByPlace.get(editingId);
        if (r)
          await editMutation.mutateAsync({
            relationId: r.shift_place_relation_id,
            payload: {
              place_id: editingId,
              comment: draftComments[editingId] ?? "",
            },
          });
      } else {
        const currentIds = relations.map((relation) => relation.place_id);
        const addedIds = draftIds.filter((id) => !currentIds.includes(id));
        const removedIds = currentIds.filter((id) => !draftIds.includes(id));
        const created = addedIds.length
          ? await addMutation.mutateAsync({
              shift_report_id: shiftReportId,
              place_ids: addedIds,
            })
          : [];
        if (removedIds.length) {
          await deleteMutation.mutateAsync({
            shift_report_id: shiftReportId,
            place_ids: removedIds,
          });
        }
        await Promise.all(
          created.map((r) =>
            editMutation.mutateAsync({
              relationId: r.shift_place_relation_id,
              payload: {
                place_id: r.place_id,
                comment: draftComments[r.place_id] ?? "",
              },
            }),
          ),
        );
      }
      setModalOpen(false);
      notification?.success({
        message: "Успешно",
        description: "Места смены обновлены",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      notification?.error({
        message: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось обновить места смены",
        placement: "bottomRight",
        duration: 2,
      });
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({
        shift_report_id: shiftReportId,
        place_ids: [id],
      });
    } catch (error) {
      notification?.error({
        message: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось удалить место",
        placement: "bottomRight",
        duration: 2,
      });
    }
  };
  if (
    placesQuery.isPending ||
    projectRelationsQuery.isPending ||
    relationsQuery.isPending
  )
    return <Spin />;
  if (
    placesQuery.isError ||
    projectRelationsQuery.isError ||
    relationsQuery.isError
  )
    return <Alert type="error" message="Не удалось загрузить места смены" />;
  return (
    <>
      <div className="shift-report__places-header">
        <Typography.Title level={4}>Места проведения работ</Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить место
          </Button>
        )}
      </div>
      {relations.length ? (
        <div className="shift-report__places-list">
          {relations.map((r) => (
            <div
              className="shift-report__place-item"
              key={r.shift_place_relation_id}
            >
              <div className="shift-report__place-content">
                <Typography.Text strong>
                  {placesById.get(r.place_id)?.name ?? r.place_id}
                </Typography.Text>
                {r.comment && (
                  <Typography.Text type="secondary">
                    {r.comment}
                  </Typography.Text>
                )}
              </div>
              {canEdit && (
                <Space size="small">
                  <Button
                    type="link"
                    icon={<EditTwoTone twoToneColor="#e40808" />}
                    onClick={() => openEdit(r.place_id)}
                  />
                  <Button
                    type="link"
                    icon={<DeleteTwoTone twoToneColor="#e40808" />}
                    onClick={() => remove(r.place_id)}
                  />
                </Space>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Места не выбраны"
        />
      )}
      <Modal
        title={editingId ? "Редактирование места" : "Добавление мест"}
        open={modalOpen}
        onCancel={() => !saving && setModalOpen(false)}
        onOk={save}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
      >
        {!editingId && (
          <Button
            type="link"
            onClick={() =>
              setDraftIds(
                draftIds.length === options.length
                  ? []
                  : options.map((o) => o.value),
              )
            }
            style={{ padding: 0, marginBottom: 12 }}
          >
            {draftIds.length === options.length ? "Снять все" : "Выбрать все"}
          </Button>
        )}
        <Checkbox.Group
          value={editingId ? [editingId] : draftIds}
          onChange={(values) => setDraftIds(values as string[])}
          disabled={Boolean(editingId)}
          options={options}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        />
      </Modal>
    </>
  );
};
