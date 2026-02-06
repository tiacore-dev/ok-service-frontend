import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Layout,
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
import { EditableCell } from "../components/editableCell";
import { IWorkPricesListColumn } from "../../interfaces/workPrices/IWorkPricesList";
import { NotificationContext } from "../../contexts/NotificationContext";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
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
  const [form] = Form.useForm<IWorkPricesListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<IWorkPricesListColumn[]>(
    [],
  );

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

  React.useEffect(() => {
    if (!isWorkPricesPending && !isWorkPricesFetching) {
      setDataSource(workPricesData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [workPricesData, isWorkPricesPending, isWorkPricesFetching]);

  const deleteWorkMutation = useDeleteWorkMutation();
  const createWorkPriceMutation = useCreateWorkPriceMutation();
  const updateWorkPriceMutation = useUpdateWorkPriceMutation();
  const deleteWorkPriceMutation = useDeleteWorkPriceMutation();

  const isEditing = (record: IWorkPricesListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IWorkPricesListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IWorkPricesListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    if (newRecordKey) {
      setDataSource(workPricesData);
      setNewRecordKey("");
    }
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(workPricesData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const row = {
          ...rowData,
          category: Number(rowData.category), // Преобразуем в число
          price: Number(rowData.price), // Преобразуем в число
          work: workData?.work_id,
        };

        if (isCreating(item)) {
          // Создание новой записи
          setActualData(false);
          setNewRecordKey("");
          if (!workData?.work_id) {
            throw new Error("Не удалось определить работу");
          }
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
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          await updateWorkPriceMutation.mutateAsync({
            workPriceId: item.work_price_id,
            payload: {
              ...row,
              work: workData?.work_id ?? "",
            },
          });
          notificationApi?.success({
            message: "Успешно",
            description: "Цена работ изменена",
            placement: "bottomRight",
            duration: 2,
          });
        }
      }
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
    }
  };

  const handleAdd = () => {
    if (!newRecordKey) {
      const newData = {
        key: "new",
        work: workData.work_id,
        price: 0,
        category: 0,
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      setEditingKey("");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDelete = async (key: string) => {
    if (!workId) return;
    try {
      setActualData(false);
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
      inputType: "number",
      dataIndex: "category",
      key: "category",
      editable: true,
      required: true,
    },
    {
      title: "Цена",
      inputType: "number",
      dataIndex: "price",
      key: "price",
      editable: true,
      required: true,
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: currentRole !== RoleId.ADMIN,
      width: !isMobile() && "116px",
      render: (_: string, record: IWorkPricesListColumn) => {
        const editable = isEditing(record) || isCreating(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              className="work__action-button"
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            />
            <Button
              icon={<CloseCircleTwoTone twoToneColor="#e40808" />}
              onClick={cancel}
            ></Button>
          </span>
        ) : (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => edit(record)}
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

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IWorkPricesListColumn) => ({
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        "data-label": col.title,
        editing: isEditing(record) || isCreating(record),
      }),
    };
  });

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
        <Content
          className="work__content"
        >
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
            onClick={handleAdd}
            type="primary"
            className="work__add-price"
          >
            Добавить цену работ
          </Button>

          <Form form={form} component={false}>
            <Table
              pagination={false}
              bordered={!isMobile()}
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              dataSource={dataSource}
              columns={mergedColumns}
              loading={isLoading}
            />
          </Form>

          <Title level={4}>Материалы на 1 ед. работы</Title>
          <WorkMaterialRelationsTable
            workId={workData.work_id}
            canManage={currentRole === RoleId.ADMIN}
          />
        </Content>
      ) : (
        <Spin />
      )}
    </>
  );
};
