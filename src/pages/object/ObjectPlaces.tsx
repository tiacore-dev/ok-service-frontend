import { Alert, Card, Empty, Space, Spin, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { DeletePlaceDialog } from "../../components/ActionDialogs/DeletePlaceDialog";
import { EditablePlaceDialog } from "../../components/ActionDialogs/EditablePlaceDialog";
import { NotificationContext } from "../../contexts/NotificationContext";
import { RoleId } from "../../interfaces/roles/IRole";
import { useDeletePlaceMutation, usePlacesQuery } from "../../queries/places";
import { getCurrentRole } from "../../store/modules/auth";
import "./ObjectPlaces.less";

interface ObjectPlacesProps {
  objectId: string;
}

export const ObjectPlaces = ({ objectId }: ObjectPlacesProps) => {
  const notificationApi = React.useContext(NotificationContext);
  const currentRole = useSelector(getCurrentRole);
  const canManage = currentRole === RoleId.ADMIN;
  const { data: places = [], isPending, isError } = usePlacesQuery();
  const { mutateAsync: deletePlace } = useDeletePlaceMutation();
  const objectPlaces = places.filter(
    (place) => place.object_id === objectId && !place.deleted,
  );

  const handleDelete = async (placeId: string, name: string) => {
    try {
      await deletePlace(placeId);
      notificationApi?.success({
        message: "Успешно",
        description: "Место удалено",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : `Не удалось удалить место ${name}`,
        placement: "bottomRight",
        duration: 2,
      });
      throw error;
    }
  };

  return (
    <Card
      className="object__places-card"
      title="Места проведения работ"
      extra={canManage ? <EditablePlaceDialog objectId={objectId} /> : null}
    >
      {isPending ? (
        <Spin />
      ) : isError ? (
        <Alert
          message="Не удалось загрузить места проведения работ"
          type="error"
        />
      ) : objectPlaces.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Мест пока нет"
        />
      ) : (
        <div className="object-places__list">
          {objectPlaces.map((place) => (
            <div className="object-places__item" key={place.place_id}>
              <div className="object-places__content">
                <Typography.Text strong>{place.name}</Typography.Text>
                {place.description && (
                  <Typography.Text type="secondary">
                    {place.description}
                  </Typography.Text>
                )}
              </div>
              {canManage && (
                <Space className="object-places__actions" size="small">
                  <EditablePlaceDialog
                    objectId={objectId}
                    place={place}
                    iconOnly
                  />
                  <DeletePlaceDialog
                    name={place.name}
                    onDelete={() => handleDelete(place.place_id, place.name)}
                  />
                </Space>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
