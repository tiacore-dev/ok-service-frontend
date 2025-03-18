import React, { useCallback, useMemo, useState } from "react";
import { ActionDialog } from "../ActionDialog";
import { FileExcelTwoTone } from "@ant-design/icons";
import { Button, Select, Space, Table } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";
import { useSelector } from "react-redux";
import { RoleId } from "../../../interfaces/roles/IRole";
import { useProjectWorks } from "../../../hooks/ApiActions/project-works";
import { getWorksData } from "../../../store/modules/pages/selectors/works.selector";
import { getCurrentRole } from "../../../store/modules/auth";
import TextArea from "antd/es/input/TextArea";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";

interface IImportProjectWorksDialogProps {
  project?: IProject;
  iconOnly?: boolean;
}

interface IUploadData {
  key: string;
  workString?: string;
  workId?: string;
  quantity?: number;
  isCorrect: boolean;
}

export const ImportProjectWorksDialog = (
  props: IImportProjectWorksDialogProps,
) => {
  // const [importData, setImportData] = useState<IUploadData[]>([]);
  const role = useSelector(getCurrentRole);
  const [uploadString, setUploadString] = useState<string>("");
  const [workIdMap, setWorkIdMap] = useState<Record<string, string>>({});
  const { project, iconOnly } = props;

  const { createProjectWorks } = useProjectWorks();

  const buttonText = "Загрузить";
  const popoverText = "Загрузить данные";
  const buttonIcon = <FileExcelTwoTone twoToneColor="#ff1616" />;
  const modalTitle = "Загрузить данные";

  const works = useSelector(getWorksData);

  const workOptions = useMemo(() => {
    return works.map((w) => ({
      label: w.name,
      value: w.work_id,
    }));
  }, [works]);

  const setWorkId = useCallback(
    (workId: string, workString: string) => {
      setWorkIdMap({ ...workIdMap, [workString]: workId });
    },
    [workIdMap],
  );
  const columns = [
    {
      title: "Текст",
      dataIndex: "workString",
      key: "workString",
      width: "25%",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
    },

    {
      title: "Работа из справочника",
      dataIndex: "workId",
      key: "workId",
      width: "30%",

      render: (text: string, record: IUploadData) => (
        <Select
          allowClear
          style={{ width: "180px" }}
          showSearch
          filterOption={selectFilterHandler}
          value={record.workId}
          onChange={(value) => setWorkId(value, record.workString)}
          options={workOptions}
        />
      ),
    },

    {
      title: "Статус",
      dataIndex: "isCorrect",
      key: "isCorrect",
      width: "25%",

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
  }, [uploadString, works, workIdMap]);

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
      const workId = works.find((w) =>
        el.workString.toLocaleLowerCase().includes(w.name.toLocaleLowerCase()),
      )?.work_id;

      if (workId) {
        result[el.workString] = workId;
      }
    });

    setWorkIdMap({ ...workIdMap, ...result });
  }, [uploadData, works]);

  const handleConfirm = useCallback(() => {
    createProjectWorks(
      correctData.map((el) => ({
        work: el.workId,
        project: project.project_id,
        quantity: el.quantity,
        signed: role === RoleId.ADMIN || role === RoleId.MANAGER,
      })),
      project.project_id,
    );
  }, [project, uploadData, correctData, createProjectWorks]);

  return (
    <ActionDialog
      modalOkText={buttonLabel}
      onConfirm={handleConfirm}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly && popoverText}
      buttonType="default"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      customModalWidth={1000}
      modalText={
        <Space direction="horizontal">
          <Space direction="vertical">
            <TextArea
              value={uploadString}
              onChange={(e) => setUploadString(e.target.value)}
              style={{ width: "300px", height: "100%" }}
            />
            <Button onClick={handleAnalysis}>
              Анализировать наименования работ
            </Button>
          </Space>
          <Table
            pagination={false}
            style={{ width: "600px" }}
            dataSource={uploadData}
            columns={columns}
          />
        </Space>
      }
    />
  );
};
