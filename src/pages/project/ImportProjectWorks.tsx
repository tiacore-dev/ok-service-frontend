import React, { useCallback, useContext, useMemo, useState } from "react";
import { Button, Space, Table } from "antd";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { IProject } from "../../interfaces/projects/IProject";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { NotificationContext } from "../../contexts/NotificationContext";
import { WorkTreeSelect } from "../../components/WorkTreeSelect/WorkTreeSelect";
import { useWorkTreeSelectData } from "../../hooks/useWorkTreeSelectData";
import {
  useCreateProjectWorksMutation,
  type EditableProjectWorkPayload,
} from "../../queries/projectWorks";
import { formatNumber } from "../../utils/formatNumber";
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
  price?: number;
  isCorrect: boolean;
}

const parseNumber = (value?: string): number =>
  Number(value?.trim().replace(/\s/g, "").replace(",", "."));

export const ImportProjectWorks = (props: IImportProjectWorksProps) => {
  const role = useSelector(getCurrentRole);
  const [uploadString, setUploadString] = useState<string>("");
  const [workIdMap, setWorkIdMap] = useState<Record<string, string>>({});
  const { project, close } = props;
  const createProjectWorksMutation = useCreateProjectWorksMutation();

  const { selectData, availableWorks } = useWorkTreeSelectData();

  const setWorkId = useCallback(
    (workId: string | undefined, workString: string) => {
      setWorkIdMap((current) => {
        const next = { ...current };
        if (workId) next[workString] = workId;
        else delete next[workString];
        return next;
      });
    },
    [],
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
      title: "Цена",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (price?: number) =>
        price === undefined
          ? "—"
          : Number.isFinite(price)
            ? formatNumber(price)
            : "Некорректная цена",
    },

    {
      title: "Работа из справочника",
      dataIndex: "workId",
      key: "workId",
      width: "650px",
      render: (text: string, record: IUploadData) => {
        return (
          <WorkTreeSelect
            data={selectData}
            value={record.workId}
            onChange={(workId) => setWorkId(workId, record.workString)}
            allowClear
            style={{ width: "100%" }}
          />
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
        const quantity = parseNumber(rowData[1]);
        const priceValue = rowData[2]?.trim();
        const price = priceValue ? parseNumber(priceValue) : undefined;
        const workId = workIdMap[workString];

        const isCorrect =
          quantity > 0 &&
          !!workId &&
          (price === undefined || (Number.isFinite(price) && price >= 0));
        return {
          key: `${i}`,
          workString,
          quantity,
          price,
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
      ...(el.price === undefined ? {} : { price: el.price }),
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
            disabled={selectData.loading || selectData.error}
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
