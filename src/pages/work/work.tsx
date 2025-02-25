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
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { useWorks } from "../../hooks/ApiActions/works";
import { EditableWorkDialog } from "../../components/ActionDialogs/EditableWorkDialog/EditableWorkDialog";
import { DeleteWorkDialog } from "../../components/ActionDialogs/DeleteWorkDialog";
import { EditableCell } from "../components/editableCell";
import { IWorkPricesListColumn } from "../../interfaces/workPrices/IWorkPricesList";
import { useWorkPrices } from "../../hooks/ApiActions/work-prices";
import { getWorkPricesByWorkId } from "../../store/modules/pages/selectors/work-prices.selector";
import { SortOrder } from "../../utils/sortOrder";
import { clearWorkPricesState } from "../../store/modules/pages/work-prices.state";
import { clearWorkState } from "../../store/modules/pages/work.state";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const Work = () => {
  const { Content } = Layout;
  const [form] = Form.useForm<IWorkPricesListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<IWorkPricesListColumn[]>(
    []
  );

  const routeParams = useParams();
  const { getWork, deleteWork } = useWorks();
  const dispatch = useDispatch();
  const currentRole = useSelector(getCurrentRole);

  const { getWorkPrices, createWorkPrice, editWorkPrice, deleteWorkPrice } =
    useWorkPrices();

  React.useEffect(() => {
    getWork(routeParams.workId);
    getWorkPrices({
      work: routeParams.workId,
      sort_by: "category",
      sort_order: SortOrder.ASC,
    });

    return () => {
      dispatch(clearWorkPricesState());
      dispatch(clearWorkState());
      setDataSource([]);
    };
  }, []);

  const workData = useSelector((state: IState) => state.pages.work.data);
  const isLoaded = useSelector((state: IState) => state.pages.work.loaded);
  const workPricesIsLoaded = useSelector(
    (state: IState) => state.pages.workPrices.loaded
  );

  const workPrices = useSelector((state: IState) =>
    getWorkPricesByWorkId(state, workData?.work_id)
  );

  const workPricesData: IWorkPricesListColumn[] = React.useMemo(
    () =>
      workPrices.map((doc) => ({
        ...doc,
        key: doc.work_price_id,
      })),
    [workPrices]
  );

  React.useEffect(() => {
    if (workPricesIsLoaded) {
      setDataSource(workPricesData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [workPricesData]);

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
  };;

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
          work: workData.work_id, // Добавляем work_id
        };

        if (isCreating(item)) {
          // Создание новой записи
          setActualData(false);
          setNewRecordKey("");
          createWorkPrice(row);
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          editWorkPrice(item.work_price_id, row);
        }
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
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

  const handleDelete = (key: string) => {
    setActualData(false);
    deleteWorkPrice(key, routeParams.workId);
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
              style={{ marginRight: 8 }}
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

  const isLoading = useSelector(
    (state: IState) => state.pages.workPrices.loading
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
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
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{workData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            <EditableWorkDialog work={workData} />
            <DeleteWorkDialog
              onDelete={() => {
                deleteWork(workData.work_id);
              }}
              name={workData.name}
            />
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Имя: {workData.name}</p>
            <p>Категория: {workData.category.name}</p>
            <p>Единица измерения: {workData.measurement_unit}</p>
          </Card>

          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            className="works_filters"
          >
            <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16 }}
            >
              Добавить цену работ
            </Button>
          </Space>

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
        </Content>
      ) : (
        <Spin />
      )}
    </>
  );
};
