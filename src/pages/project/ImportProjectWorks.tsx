import React, { useCallback, useMemo, useState } from "react";
import { Button, Dropdown, Menu, Space, Table } from "antd";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { IProject } from "../../interfaces/projects/IProject";
import { getCurrentRole } from "../../store/modules/auth";
import { useProjectWorks } from "../../hooks/ApiActions/project-works";
import { IState } from "../../store/modules";
import { getWorksData } from "../../store/modules/pages/selectors/works.selector";
import { RoleId } from "../../interfaces/roles/IRole";

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

  const { createProjectWorks } = useProjectWorks();

  const works = useSelector((state: IState) => getWorksData(state, true));

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
          <Menu style={{ maxHeight: "400px", overflowY: "auto" }}>
            {workOptions.map((opt) => (
              <Menu.Item
                key={opt.value}
                onClick={() => setWorkId(opt.value, record.workString)}
              >
                <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  {opt.label}
                </div>
              </Menu.Item>
            ))}
          </Menu>
        );

        const buttonText = record.workId
          ? works.find((w) => w.work_id === record.workId)?.name
          : "Выберите работу";

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              style={{
                width: "620px",
                textAlign: "left",
                whiteSpace: "normal",
                wordBreak: "break-word",
                height: "auto",
                minHeight: "32px",
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "100%",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
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
        project_work_name: el.workString,
        project: project.project_id,
        quantity: el.quantity,
        signed: role === RoleId.ADMIN || role === RoleId.MANAGER,
      })),
      project.project_id,
    );
    close();
  }, [project, uploadData, correctData, createProjectWorks]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div
        style={{ display: "flex", flex: 1, gap: "16px", overflow: "hidden" }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", width: "300px" }}
        >
          <TextArea
            value={uploadString}
            onChange={(e) => setUploadString(e.target.value)}
            style={{ flex: 1, marginBottom: "16px" }}
          />
          <Button onClick={handleAnalysis} style={{ marginBottom: "16px" }}>
            Анализировать наименования работ
          </Button>
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <Table
            pagination={false}
            style={{ width: "100%", height: "100%" }}
            dataSource={uploadData}
            columns={columns}
          />
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
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
