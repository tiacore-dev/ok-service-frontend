import React, { useCallback, useContext, useMemo, useState } from "react";
import { Button, Dropdown, Input, Menu, Space, Table } from "antd";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { IProject } from "../../interfaces/projects/IProject";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useWorksMap } from "../../queries/works";
import {
  useCreateProjectWorksMutation,
  type EditableProjectWorkPayload,
} from "../../queries/projectWorks";
import "./ImportProjectWorks.less";

interface IImportProjectWorksProps {
  project?: IProject;
  close: () => void;
}

interface IUploadData {
  key: string;
  workString?: string;
  workId?: string;
  quantity?: number;
  isCorrect: boolean;
}

export const ImportProjectWorks = (props: IImportProjectWorksProps) => {
  const role = useSelector(getCurrentRole);
  const [uploadString, setUploadString] = useState<string>("");
  const [workIdMap, setWorkIdMap] = useState<Record<string, string>>({});
  const { project, close } = props;
  const [search, setSearch] = useState<string>("");
  const createProjectWorksMutation = useCreateProjectWorksMutation();

  const { works } = useWorksMap();

  const availableWorks = useMemo(
    () => works.filter((w) => !w.deleted),
    [works],
  );

  const workOptions = useMemo(() => {
    return availableWorks.map((w) => ({
      label: w.name,
      value: w.work_id,
    }));
  }, [availableWorks]);

  const setWorkId = useCallback(
    (workId: string, workString: string) => {
      setWorkIdMap({ ...workIdMap, [workString]: workId });
    },
    [workIdMap],
  );

  const columns = [
    {
      title: "Наименование",
      dataIndex: "workString",
      key: "workString",
      width: "25%",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
    },

    {
      title: "Работа из справочника",
      dataIndex: "workId",
      key: "workId",
      width: "650px",
      render: (text: string, record: IUploadData) => {
        const menu = (
          <Menu className="import-project-works__menu">
            <Input
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            ></Input>

            {workOptions
              .filter(
                (el) =>
                  search === "" ||
                  (el?.label ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((opt) => (
                <Menu.Item
                  key={opt.value}
                  onClick={() => {
                    setWorkId(opt.value, record.workString);
                    setSearch("");
                  }}
                >
                  <div className="import-project-works__menu-item">
                    {opt.label}
                  </div>
                </Menu.Item>
              ))}
          </Menu>
        );

        const buttonText = record.workId
          ? availableWorks.find((w) => w.work_id === record.workId)?.name
          : "Выберите работу";

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              className="import-project-works__dropdown-button"
            >
              <span
                className="import-project-works__dropdown-text"
              >
                {buttonText}
              </span>
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "isCorrect",
      key: "isCorrect",
      width: "15%",

      render: (text: string, record: IUploadData) => (
        <div>{record.isCorrect ? "Готов к загрузке" : "Ошибка"}</div>
      ),
    },
  ];

  const uploadData: IUploadData[] = useMemo(() => {
    const rows = uploadString.split(String.fromCharCode(10));
    const data = rows
      .filter((row) => row)
      .map((row, i) => {
        const rowData = row.split(String.fromCharCode(9));
        const workString = rowData[0] ?? "";
        const quantity = Number(rowData[1]) ?? 0;
        const workId = workIdMap[workString];

        const isCorrect = quantity > 0 && !!workId;
        return {
          key: `${i}`,
          workString,
          quantity,
          workId,
          isCorrect,
        };
      });

    return data;
  }, [uploadString, availableWorks, workIdMap]);

  const correctData = useMemo(
    () => uploadData.filter((el) => el.isCorrect),
    [uploadData],
  );

  const buttonLabel = useMemo(
    () => `Загрузить ${correctData.length} из ${uploadData.length}`,
    [uploadData, correctData],
  );

  const handleAnalysis = useCallback(() => {
    const result: Record<string, string> = {};

    uploadData.forEach((el) => {
      const workId = availableWorks.find((w) =>
        el.workString.toLocaleLowerCase().includes(w.name.toLocaleLowerCase()),
      )?.work_id;

      if (workId) {
        result[el.workString] = workId;
      }
    });

    setWorkIdMap({ ...workIdMap, ...result });
  }, [uploadData, availableWorks]);

  const notificationApi = useContext(NotificationContext);

  const handleConfirm = useCallback(async () => {
    if (!project?.project_id) {
      notificationApi?.error({
        message: "Ошибка",
        description: "Не удалось определить спецификацию",
        placement: "bottomRight",
        duration: 2,
      });
      return;
    }

    const payload: EditableProjectWorkPayload[] = correctData.map((el) => ({
      work: el.workId!,
      project_work_name: el.workString ?? "",
      project: project.project_id!,
      quantity: el.quantity ?? 0,
      signed: role === RoleId.ADMIN || role === RoleId.MANAGER,
    }));

    try {
      await createProjectWorksMutation.mutateAsync({
        projectId: project.project_id,
        payload,
      });
      notificationApi?.success({
        message: "Успешно",
        description: "Работы добавлены в спецификацию",
        placement: "bottomRight",
        duration: 2,
      });
      close();
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при добавлении работ в спецификацию";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    project,
    correctData,
    createProjectWorksMutation,
    notificationApi,
    close,
    role,
  ]);

  return (
    <div className="import-project-works">
      <div className="import-project-works__body">
        <div className="import-project-works__sidebar">
          <TextArea
            value={uploadString}
            onChange={(e) => setUploadString(e.target.value)}
            className="import-project-works__textarea"
          />
          <Button
            onClick={handleAnalysis}
            className="import-project-works__analyze-button"
          >
            Анализировать наименования работ
          </Button>
        </div>

        <div className="import-project-works__table-wrapper">
          <Table
            pagination={false}
            className="import-project-works__table"
            dataSource={uploadData}
            columns={columns}
          />
        </div>
      </div>

      <div className="import-project-works__footer">
        <Space>
          <Button onClick={handleConfirm} type="primary">
            {buttonLabel}
          </Button>
          <Button onClick={close}>Закрыть</Button>
        </Space>
      </div>
    </div>
  );
};
