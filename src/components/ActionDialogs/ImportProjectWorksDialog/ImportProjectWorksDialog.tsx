import React, { useCallback, useMemo, useState } from "react";
import { ActionDialog } from "../ActionDialog";
import { FileExcelTwoTone } from "@ant-design/icons";
import { Space, Table } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";
import { useSelector } from "react-redux";
import { RoleId } from "../../../interfaces/roles/IRole";
import { useProjectWorks } from "../../../hooks/ApiActions/project-works";
import { getWorksData } from "../../../store/modules/pages/selectors/works.selector";
import { getCurrentRole } from "../../../store/modules/auth";
import TextArea from "antd/es/input/TextArea";

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

  const { project, iconOnly } = props;

  const { createProjectWorks } = useProjectWorks();

  const buttonText = "Загрузить";
  const popoverText = "Загрузить данные";
  const buttonIcon = <FileExcelTwoTone twoToneColor="#ff1616" />;
  const modalTitle = "Загрузить данные";

  const works = useSelector(getWorksData);

  const columns = [
    {
      title: "Текст",
      dataIndex: "workString",
      key: "workString",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },

    {
      title: "Работа из справочника",
      dataIndex: "workId",
      key: "workId",

      render: (text: string, record: IUploadData) => (
        <div>{works.find((w) => w.work_id === record.workId)?.name}</div>
      ),
    },

    {
      title: "Статус",
      dataIndex: "isCorrect",
      key: "isCorrect",

      render: (text: string, record: IUploadData) => (
        <div>{record.isCorrect ? "Готов к загрузе" : "Ошибка"}</div>
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
        const workId = works.find((w) =>
          workString.toLocaleLowerCase().includes(w.name.toLocaleLowerCase()),
        )?.work_id;

        const isCorrect = quantity > 0 && !!workId;
        return {
          key: `${i}-${workId}`,
          workString,
          quantity,
          workId,
          isCorrect,
        };
      });

    return data;
  }, [uploadString, works]);

  const correctData = useMemo(
    () => uploadData.filter((el) => el.isCorrect),
    [uploadData],
  );

  const buttonLabel = useMemo(
    () => `Загрузить ${correctData.length} из ${uploadData.length}`,
    [uploadData, correctData],
  );

  const handleConfirm = useCallback(() => {
    if (uploadData.every((el) => el.isCorrect)) {
      createProjectWorks(
        correctData.map((el) => ({
          work: el.workId,
          project: project.project_id,
          quantity: el.quantity,
          signed: role === RoleId.ADMIN || role === RoleId.MANAGER,
        })),
        project.project_id,
      );
    }
  }, [project, uploadData, createProjectWorks]);

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
          <TextArea
            value={uploadString}
            onChange={(e) => setUploadString(e.target.value)}
            style={{ width: "300px", height: "100%" }}
          />
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
