import { Alert, Button, Checkbox, Empty, Modal, Spin, Typography } from "antd";
import { DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import React from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { usePlacesQuery } from "../../queries/places";
import { useAddProjectPlaceRelationsMutation, useDeleteProjectPlaceRelationMutation, useDeleteProjectPlaceRelationsMutation, useProjectPlaceRelationsQuery } from "../../queries/projectPlaceRelations";

interface ProjectPlacesProps { projectId: string; objectId: string; canEdit: boolean; }
export const ProjectPlaces = ({ projectId, objectId, canEdit }: ProjectPlacesProps) => {
  const notification = React.useContext(NotificationContext);
  const placesQuery = usePlacesQuery();
  const relationsQuery = useProjectPlaceRelationsQuery();
  const addMutation = useAddProjectPlaceRelationsMutation();
  const bulkDeleteMutation = useDeleteProjectPlaceRelationsMutation();
  const deleteMutation = useDeleteProjectPlaceRelationMutation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [draftIds, setDraftIds] = React.useState<string[]>([]);
  const [savedIds, setSavedIds] = React.useState<string[]>([]);
  const places = React.useMemo(() => (placesQuery.data ?? []).filter((p) => p.object_id === objectId && !p.deleted), [placesQuery.data, objectId]);
  const relations = React.useMemo(() => (relationsQuery.data ?? []).filter((r) => r.project_id === projectId), [relationsQuery.data, projectId]);
  React.useEffect(() => { const ids = relations.map((r) => r.place_id); setSavedIds(ids); setDraftIds(ids); }, [relations]);
  const saving = addMutation.isPending || bulkDeleteMutation.isPending || deleteMutation.isPending;
  const openModal = () => { setDraftIds(savedIds); setModalOpen(true); };
  const save = async () => { try {
    const added = draftIds.filter((id) => !savedIds.includes(id));
    const removed = savedIds.filter((id) => !draftIds.includes(id));
    if (added.length) await addMutation.mutateAsync({ project_id: projectId, place_ids: added });
    if (removed.length) await bulkDeleteMutation.mutateAsync({ project_id: projectId, place_ids: removed });
    setSavedIds(draftIds); setModalOpen(false);
    notification?.success({ message: "Успешно", description: "Места спецификации обновлены", placement: "bottomRight", duration: 2 });
  } catch (error) { notification?.error({ message: "Ошибка", description: error instanceof Error ? error.message : "Не удалось обновить места", placement: "bottomRight", duration: 2 }); } };
  const remove = async (relationId: string) => { try { await deleteMutation.mutateAsync(relationId); } catch (error) { const status = (error as { response?: { status?: number } })?.response?.status; notification?.error({ message: "Ошибка", description: status === 409 ? "Место используется в смене" : error instanceof Error ? error.message : "Не удалось удалить место", placement: "bottomRight", duration: 2 }); } };
  const loading = placesQuery.isPending || relationsQuery.isPending;
  if (loading) return <section className="project__places-section"><Spin /></section>;
  if (placesQuery.isError || relationsQuery.isError) return <section className="project__places-section"><Alert type="error" message="Не удалось загрузить места проведения работ" /></section>;
  const placeById = new Map(places.map((p) => [p.place_id, p]));
  return <section className="project__places-section">
    <div className="project__section-header"><Typography.Title level={4} className="project__section-title">Места проведения работ</Typography.Title>{canEdit && <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>Добавить место</Button>}</div>
    {relations.length ? <div className="places-list">{relations.map((r) => <div className="places-list__item" key={r.project_place_relation_id}><Typography.Text strong>{placeById.get(r.place_id)?.name ?? r.place_id}</Typography.Text>{canEdit && <Button type="link" icon={<DeleteTwoTone twoToneColor="#e40808" />} loading={saving} onClick={() => remove(r.project_place_relation_id)} />}</div>)}</div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Места не выбраны" />}
    <Modal title="Места спецификации" open={modalOpen} onCancel={() => !saving && setModalOpen(false)} onOk={save} okText="Сохранить" cancelText="Отмена" confirmLoading={saving}>
      <Button type="link" onClick={() => setDraftIds(draftIds.length === places.length ? [] : places.map((place) => place.place_id))} style={{ padding: 0, marginBottom: 12 }}>
        {draftIds.length === places.length ? "Снять все" : "Выбрать все"}
      </Button>
      <Checkbox.Group value={draftIds} onChange={(values) => setDraftIds(values as string[])} options={places.map((p) => ({ label: p.name, value: p.place_id }))} style={{ display: "flex", flexDirection: "column", gap: 8 }} />
    </Modal>
  </section>;
};
