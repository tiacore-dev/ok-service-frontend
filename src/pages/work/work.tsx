import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  InputNumber,
  Layout,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { isMobile } from "../../utils/isMobile";
import { Link, useNavigate } from "react-router-dom";
import { EditableWorkDialog } from "../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { DeleteWorkDialog } from "../../components/ActionDialogs/DeleteWorkDialog";
import { IWorkPricesListColumn } from "../../interfaces/workPrices/IWorkPricesList";
import { NotificationContext } from "../../contexts/NotificationContext";
import {
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { useDeleteWorkMutation, useWorkQuery } from "../../queries/works";
import { WorkMaterialRelationsTable } from "../components/WorkMaterialRelationsTable";
import {
  useCreateWorkPriceMutation,
  useDeleteWorkPriceMutation,
  useUpdateWorkPriceMutation,
  useWorkPricesQuery,
} from "../../queries/workPrices";
import "./work.less";

export const Work = () => {
  const { Content } = Layout;
  const [form] = Form.useForm<{ category: number; price: number }>();
  const [priceModalOpen, setPriceModalOpen] = React.useState(false);
  const [savingPrice, setSavingPrice] = React.useState(false);
  const [editingPrice, setEditingPrice] =
    React.useState<IWorkPricesListColumn | null>(null);

  const routeParams = useParams();
  const workId = routeParams.workId;
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);
  const notificationApi = React.useContext(NotificationContext);

  const {
    data: workData,
    isPending: isWorkPending,
    isFetching: isWorkFetching,
  } = useWorkQuery(workId, { enabled: Boolean(workId) });

  const workPricesParams = React.useMemo(
    () =>
      workId
        ? {
            work: workId,
            sort_by: "category",
            sort_order: "asc",
          }
        : undefined,
    [workId],
  );

  const {
    data: workPrices = [],
    isPending: isWorkPricesPending,
    isFetching: isWorkPricesFetching,
  } = useWorkPricesQuery(workPricesParams, { enabled: Boolean(workId) });

  const workPricesData: IWorkPricesListColumn[] = React.useMemo(
    () =>
      (workPrices ?? []).map((doc) => ({
        ...doc,
        key: doc.work_price_id,
      })),
    [workPrices],
  );

  const deleteWorkMutation = useDeleteWorkMutation();
  const createWorkPriceMutation = useCreateWorkPriceMutation();
  const updateWorkPriceMutation = useUpdateWorkPriceMutation();
  const deleteWorkPriceMutation = useDeleteWorkPriceMutation();

  const openCreatePrice = () => {
    if (!workData?.work_id) return;
    setEditingPrice(null);
    form.setFieldsValue({ category: 0, price: 0 });
    setPriceModalOpen(true);
  };

  const openEditPrice = (record: IWorkPricesListColumn) => {
    setEditingPrice(record);
    form.setFieldsValue({
      category: Number(record.category ?? 0),
      price: Number(record.price ?? 0),
    });
    setPriceModalOpen(true);
  };

  const closePriceModal = () => {
    setPriceModalOpen(false);
    setEditingPrice(null);
    form.resetFields();
  };

  const save = async () => {
    try {
      const rowData = await form.validateFields();
      const row = {
        category: Number(rowData.category),
        price: Number(rowData.price),
        work: workData?.work_id ?? "",
      };

      if (!workData?.work_id) {
        throw new Error("Не удалось определить работу");
      }

      setSavingPrice(true);
      if (editingPrice) {
        await updateWorkPriceMutation.mutateAsync({
          workPriceId: editingPrice.work_price_id,
          payload: {
            ...row,
            work: workData.work_id,
          },
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Цена работ изменена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createWorkPriceMutation.mutateAsync({
          ...row,
          work: workData.work_id,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Цена работ создана",
          placement: "bottomRight",
          duration: 2,
        });
      }
      closePriceModal();
    } catch (errInfo) {
      const description =
        errInfo instanceof Error
          ? errInfo.message
          : "Не удалось сохранить цену работы";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    } finally {
      setSavingPrice(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!workId) return;
    try {
      await deleteWorkPriceMutation.mutateAsync({
        workPriceId: key,
        workId,
      });
      notificationApi?.success({
        message: "Удалено",
        description: "Цена работ удалена",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Не удалось удалить цену работы";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const columns = [
    {
      title: "Разряд",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: currentRole !== RoleId.ADMIN,
      width: !isMobile() && "116px",
      render: (_: string, record: IWorkPricesListColumn) => {
        return (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => openEditPrice(record)}
            />
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button
                icon={<DeleteTwoTone twoToneColor="#e40808" />}
                type="link"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const isLoaded =
    !isWorkPending &&
    !isWorkFetching &&
    Boolean(workData && workId && workId === workData.work_id);

  const isLoading = isWorkPricesPending || isWorkPricesFetching;

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/works">Работы</Link>,
          },
          { title: workData?.name },
        ]}
      />
      {isLoaded && workData && routeParams.workId === workData.work_id ? (
        <Content className="work__content">
          <Title level={3}>{workData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            <EditableWorkDialog work={workData} />
            {!workData.deleted && (
              <DeleteWorkDialog
                onDelete={async () => {
                  if (!workData.work_id) return;
                  try {
                    await deleteWorkMutation.mutateAsync(workData.work_id);
                    notificationApi?.success({
                      message: "Удалено",
                      description: "Работа удалена",
                      placement: "bottomRight",
                      duration: 2,
                    });
                    navigate("/works");
                  } catch (error) {
                    const description =
                      error instanceof Error
                        ? error.message
                        : "Не удалось удалить работу";
                    notificationApi?.error({
                      message: "Ошибка",
                      description,
                      placement: "bottomRight",
                      duration: 2,
                    });
                  }
                }}
                name={workData.name}
              />
            )}
          </Space>
          <Card className="work__card">
            <p>Имя: {workData.name}</p>
            <p>Категория: {workData.category.name}</p>
            <p>Единица измерения: {workData.measurement_unit}</p>
            <p>{workData.deleted && "Удалено"}</p>
          </Card>

          <Title level={4}>Цены</Title>

          <Button
            onClick={openCreatePrice}
            type="primary"
            className="work__add-price"
          >
            Добавить цену работ
          </Button>

          <Table
            pagination={false}
            bordered={!isMobile()}
            dataSource={workPricesData}
            columns={columns}
            loading={isLoading}
          />

          <Title level={4}>Материалы на 1 ед. работы</Title>
          <WorkMaterialRelationsTable
            workId={workData.work_id}
            canManage={currentRole === RoleId.ADMIN}
          />
        </Content>
      ) : (
        <Spin />
      )}
      <Modal
        title={
          editingPrice ? "Редактирование цены работ" : "Создание цены работ"
        }
        open={priceModalOpen}
        onOk={save}
        onCancel={closePriceModal}
        confirmLoading={savingPrice}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Разряд"
            name="category"
            rules={[{ required: true, message: "Укажите разряд" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Цена"
            name="price"
            rules={[{ required: true, message: "Укажите цену" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
