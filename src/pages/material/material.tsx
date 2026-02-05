"use client";

import * as React from "react";
import { Breadcrumb, Card, Layout, Space, Spin } from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { EditableMaterialDialog } from "../../components/ActionDialogs/EditableMaterialDialog/EditableMaterialDialog";
import { DeleteMaterialDialog } from "../../components/ActionDialogs/DeleteMaterialDialog";
import { ActionDialog } from "../../components/ActionDialogs/ActionDialog";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useDeleteMaterialMutation,
  useHardDeleteMaterialMutation,
  useMaterialQuery,
} from "../../queries/materials";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useContext, useMemo } from "react";
import { dateTimestampToLocalString } from "../../utils/dateConverter";

export const Material = () => {
  const { Content } = Layout;
  const routeParams = useParams();
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);
  const materialId = routeParams.materialId;
  const {
    data: materialData,
    isPending,
    isFetching,
  } = useMaterialQuery(materialId, {
    enabled: Boolean(materialId),
  });
  const { mutateAsync: deleteMaterial } = useDeleteMaterialMutation();
  const { mutateAsync: hardDeleteMaterial } = useHardDeleteMaterialMutation();
  const currentRole = useSelector(getCurrentRole);

  const isLoaded = useMemo(
    () => Boolean(materialData && materialId === materialData.material_id),
    [materialData, materialId],
  );

  const handleDelete = React.useCallback(async () => {
    if (!materialData) {
      return;
    }

    try {
      await deleteMaterial(materialData.material_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Материал удалён",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/materials");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении материала";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [materialData, deleteMaterial, notificationApi, navigate]);

  const handleHardDelete = React.useCallback(async () => {
    if (!materialData) {
      return;
    }

    try {
      await hardDeleteMaterial(materialData.material_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Материал удален навсегда",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/materials");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении материала";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [materialData, hardDeleteMaterial, notificationApi, navigate]);

  const isLoading = isPending || isFetching;

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/materials">Материалы</Link>,
          },
          { title: materialData?.name },
        ]}
      />
      {isLoaded && materialData ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{materialData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole === RoleId.ADMIN && (
              <EditableMaterialDialog material={materialData} />
            )}
            {currentRole === RoleId.ADMIN && !materialData.deleted && (
              <DeleteMaterialDialog
                onDelete={handleDelete}
                name={materialData.name}
              />
            )}
            {currentRole === RoleId.ADMIN && materialData.deleted && (
              <ActionDialog
                buttonText="Удалить навсегда"
                buttonType="default"
                buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
                modalTitle={`Подтверждение удаления материала ${materialData.name}`}
                modalText={
                  <p>
                    Вы действительно хотите удалить материал {materialData.name}{" "}
                    навсегда?
                  </p>
                }
                onConfirm={handleHardDelete}
              />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {materialData.name}</p>
            <p>Единица измерения: {materialData.measurement_unit}</p>
            <p>
              Дата создания:{" "}
              {materialData.created_at
                ? dateTimestampToLocalString(materialData.created_at * 1000)
                : "—"}
            </p>
            {materialData.deleted && <p>Удалено</p>}
          </Card>
        </Content>
      ) : (
        <Spin spinning={isLoading} />
      )}
    </>
  );
};
