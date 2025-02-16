import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Form,
  Layout,
  Popconfirm,
  Space,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useShiftReports } from "../../hooks/ApiActions/shift-reports";
import { EditableShiftReportDialog } from "../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { Link } from "react-router-dom";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { getProjectsMap } from "../../store/modules/pages/selectors/projects.selector";
import { dateTimestampToLocalString } from "../../utils/dateConverter";
import { EditableCell } from "../components/editableCell";
import { IShiftReportDetailsListColumn } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { getshiftReportDetailsByShiftReportId } from "../../store/modules/pages/selectors/shift-report-details.selector";
import { useShiftReportDetails } from "../../hooks/ApiActions/shift-report-detail";
import { getWorksByProjectId } from "../../store/modules/pages/selectors/works.selector";
import { getShiftReportData } from "../../store/modules/pages/selectors/shift-report.selector";
import { clearShiftReportDetailsState } from "../../store/modules/pages/shift-report-details.state";
import { clearShiftReportState } from "../../store/modules/pages/shift-report.state";
import { useUsers } from "../../hooks/ApiActions/users";
import { useProjects } from "../../hooks/ApiActions/projects";
import { useWorks } from "../../hooks/ApiActions/works";
import { useProjectWorks } from "../../hooks/ApiActions/project-works";
import { clearProjectWorksState } from "../../store/modules/pages/project-works.state";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";
import { RoleId } from "../../interfaces/roles/IRole";
import { getCurrentCategory, getCurrentRole } from "../../store/modules/auth";
import { useWorkPrices } from "../../hooks/ApiActions/work-prices";

export const ShiftReport = () => {
  const [form] = Form.useForm<IShiftReportDetailsListColumn>();
  const [dataSource, setDataSource] = React.useState<
    IShiftReportDetailsListColumn[]
  >([]);
  const dispatch = useDispatch();
  const currentRole = useSelector(getCurrentRole);

  const {
    getShiftReportDetails,
    createShiftReportDetail,
    editShiftReportDetail,
    deleteShiftReportDetail,
  } = useShiftReportDetails();

  const [actualData, setActualData] = React.useState<boolean>(false);
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const { Content } = Layout;
  const { getUsers } = useUsers();
  const { getProjects } = useProjects();
  const { getWorks } = useWorks();
  const { getProjectWorks } = useProjectWorks();
  const { calculateWorkPrice } = useWorkPrices();
  const currentCategory = useSelector(getCurrentCategory);
  const usersMap = useSelector(getUsersMap);
  const projectsMap = useSelector(getProjectsMap);

  const routeParams = useParams();
  const { getShiftReport, editShiftReport, deleteShiftReport } =
    useShiftReports();

  React.useEffect(() => {
    getProjects();
    getUsers();
    getWorks();
    getShiftReport(routeParams.shiftId);
    getShiftReportDetails({ shift_report: routeParams.shiftId });

    return () => {
      dispatch(clearShiftReportDetailsState());
      dispatch(clearShiftReportState());
      dispatch(clearProjectWorksState());
    };
  }, []);

  const shiftReportData = useSelector(getShiftReportData);

  const canEdit: boolean =
    currentRole !== RoleId.USER || !shiftReportData?.signed;

  React.useEffect(() => {
    getProjectWorks(shiftReportData?.project);
  }, [shiftReportData?.project]);

  const worksData = useSelector((state: IState) =>
    getWorksByProjectId(state, shiftReportData?.project)
  );

  const worksOptions = worksData.map((el) => ({
    label: el.name,
    value: el.work_id,
  }));

  const shiftReportDetails = useSelector((state: IState) =>
    getshiftReportDetailsByShiftReportId(
      state,
      shiftReportData?.shift_report_id
    )
  );

  const shiftReportDetailsData: IShiftReportDetailsListColumn[] = React.useMemo(
    () =>
      shiftReportDetails.map((doc) => ({
        ...doc,
        key: doc.shift_report_detail_id,
      })),
    [shiftReportDetails]
  );

  const shiftReportDetailsIsLoaded = useSelector(
    (state: IState) => state.pages.shiftReportDetails.loaded
  );

  React.useEffect(() => {
    if (shiftReportDetailsIsLoaded) {
      setDataSource(shiftReportDetailsData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [shiftReportDetailsData]);

  const isLoaded = useSelector(
    (state: IState) => state.pages.shiftReport.loaded
  );

  const isEditing = (record: IShiftReportDetailsListColumn) =>
    record.key === editingKey;

  const isCreating = (record: IShiftReportDetailsListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IShiftReportDetailsListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(shiftReportDetailsData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const price = await calculateWorkPrice({
          work: rowData.work,
          category: currentCategory,
        });
        const row = {
          ...rowData,
          quantity: Number(rowData.quantity),
          shift_report: shiftReportData.shift_report_id,
          summ: price * Number(rowData.quantity),
        };

        if (isCreating(item)) {
          // Создание новой записи
          setActualData(false);
          setNewRecordKey("");
          createShiftReportDetail(row);
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          editShiftReportDetail(item.shift_report_detail_id, row);
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
        shift_report: shiftReportData.shift_report_id,
        work: "",
        quantity: 0,
        summ: 0,
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDelete = (key: string) => {
    setActualData(false);
    deleteShiftReportDetail(key, routeParams.workId);
  };

  const columns = [
    {
      title: "Работа",
      type: "select",
      options: worksOptions,
      dataIndex: "work",
      key: "work",
      editable: true,
      required: true,
    },
    {
      title: "Количество",
      inputType: "number",
      dataIndex: "quantity",
      key: "quantity",
      editable: true,
      required: true,
    },
    {
      title: "Сумма",
      inputType: "number",
      dataIndex: "summ",
      key: "summ",
      editable: false,
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: "116px",
      hidden: !canEdit,
      render: (_: string, record: IShiftReportDetailsListColumn) => {
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
      onCell: (record: IShiftReportDetailsListColumn) => ({
        type: col.type,
        options: col.options,
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record) || isCreating(record),
      }),
    };
  });

  const isLoading = useSelector(
    (state: IState) => state.pages.shiftReportDetails.loading
  );

  const footer = React.useCallback(() => {
    return `Итого по отчету: ${shiftReportDetailsData.reduce(
      (acc: number, val) => {
        return (acc = acc + val.summ);
      },
      0
    )} руб.`;
  }, [shiftReportDetailsData]);

  const handleOnSign = React.useCallback(() => {
    editShiftReport(shiftReportData.shift_report_id, {
      ...shiftReportData,
      signed: true,
    });
  }, [shiftReportData]);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/">Главная</Link> },
          {
            title: <Link to="/shifts">Смены</Link>,
          },
          {
            title: `Смена № ${shiftReportData?.number?.toString().padStart(5, "0")}`,
          },
        ]}
      />
      {isLoaded &&
      shiftReportData &&
      routeParams.shiftId === shiftReportData.shift_report_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title
            level={3}
          >{`Отчет по смене № ${shiftReportData.number?.toString().padStart(5, "0")} от ${dateTimestampToLocalString(shiftReportData.date)}, ${usersMap[shiftReportData.user]?.name}`}</Title>
          <Space direction={"horizontal"} size="small">
            {canEdit && (
              <EditableShiftReportDialog shiftReport={shiftReportData} />
            )}
            {canEdit && (
              <DeleteShiftReportDialog
                onDelete={() => {
                  deleteShiftReport(shiftReportData.shift_report_id);
                }}
                number={shiftReportData.number}
              />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Номер: {shiftReportData.number?.toString().padStart(5, "0")}</p>
            <p>Дата: {dateTimestampToLocalString(shiftReportData.date)}</p>
            <p>Исполнитель: {usersMap[shiftReportData.user]?.name}</p>
            <p>Спецификация: {projectsMap[shiftReportData.project]?.name}</p>
            <p>{`Прораб: ${usersMap[projectsMap[shiftReportData.project]?.project_leader]?.name}`}</p>
            <p>{shiftReportData.signed ? "Согласовано" : "Не согласовано"}</p>
            {!shiftReportData?.signed && currentRole !== RoleId.USER && (
              <div>
                <Button onClick={handleOnSign} type="primary">
                  Согласовано
                </Button>
              </div>
            )}
          </Card>

          {canEdit && (
            <Space
              direction={isMobile() ? "vertical" : "horizontal"}
              className="shift-reports_filters"
            >
              <Button
                onClick={handleAdd}
                type="primary"
                style={{ marginBottom: 16 }}
              >
                Добавить запись отчета по смене
              </Button>
            </Space>
          )}

          <Form form={form} component={false}>
            <Table
              bordered
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              dataSource={dataSource}
              columns={mergedColumns}
              loading={isLoading}
              footer={footer}
            />
          </Form>
        </Content>
      ) : (
        <></>
      )}
    </>
  );
};
