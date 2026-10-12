import * as React from "react";
import { Button, Space, Table, Typography, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { IProject } from "../../interfaces/projects/IProject";
import type {
  IProjectSpecificationImportMaterial,
  IProjectSpecificationImportPayload,
  IProjectSpecificationImportWork,
  IProjectSpecificationParseResult,
} from "../../interfaces/projects/IProjectSpecificationImport";
import { useWorksMap } from "../../queries/works";
import { useMaterialsMap } from "../../queries/materials";
import {
  useImportProjectWorksAndMaterialsMutation,
  useParseProjectSpecificationMutation,
} from "../../queries/projects";
import { NotificationContext } from "../../contexts/NotificationContext";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { formatNumber } from "../../utils/formatNumber";
import "./ImportProjectWorks.less";

interface ImportProjectSpecificationProps {
  project: IProject;
  close: () => void;
}

const SUPPORTED_FILE_EXTENSIONS = ["csv", "xml", "json"];

const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase();

const formatPrice = (price?: number | null) =>
  price == null ? "—" : formatNumber(price);

export const ImportProjectSpecification: React.FC<
  ImportProjectSpecificationProps
> = ({ project, close }) => {
  const notificationApi = React.useContext(NotificationContext);
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedSpecification, setParsedSpecification] =
    React.useState<IProjectSpecificationParseResult | null>(null);
  const { worksMap } = useWorksMap();
  const { materialsMap } = useMaterialsMap();
  const parseMutation = useParseProjectSpecificationMutation();
  const importMutation = useImportProjectWorksAndMaterialsMutation();

  const beforeUpload: UploadProps["beforeUpload"] = (nextFile) => {
    const extension = getFileExtension(nextFile.name);
    if (!extension || !SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
      notificationApi?.error({
        message: "Неподдерживаемый формат",
        description: "Выберите файл в формате CSV, XML или JSON.",
        placement: "bottomRight",
        duration: 3,
      });
      return Upload.LIST_IGNORE;
    }

    setFile(nextFile as File);
    setParsedSpecification(null);
    return false;
  };

  const removeFile = () => {
    setFile(null);
    setParsedSpecification(null);
  };

  const handleParse = async () => {
    if (!file) {
      return;
    }

    try {
      const result = await parseMutation.mutateAsync(file);
      setParsedSpecification(result);
    } catch (error) {
      notificationApi?.error({
        message: "Не удалось распознать спецификацию",
        description: getApiErrorMessage(
          error,
          "Попробуйте выбрать другой файл.",
        ),
        placement: "bottomRight",
        duration: 3,
      });
    }
  };

  const importPayload =
    React.useMemo<IProjectSpecificationImportPayload | null>(() => {
      if (!parsedSpecification) {
        return null;
      }

      return {
        project_works: parsedSpecification.project_works.map((work) => ({
          ...work,
          ...(work.price == null ? { price: undefined } : {}),
        })),
        project_materials: parsedSpecification.project_materials.map(
          (material) => ({
            ...material,
            ...(material.price == null ? { price: undefined } : {}),
            ...(material.project_work == null
              ? { project_work: undefined }
              : {}),
          }),
        ),
      };
    }, [parsedSpecification]);

  const handleImport = async () => {
    if (!project.project_id || !importPayload) {
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        projectId: project.project_id,
        payload: importPayload,
      });
      notificationApi?.success({
        message: "Спецификация импортирована",
        description: `Добавлено работ: ${result.project_works_created}. Материалов: ${result.project_materials_created}.`,
        placement: "bottomRight",
        duration: 3,
      });
      close();
    } catch (error) {
      notificationApi?.error({
        message: "Не удалось импортировать спецификацию",
        description: getApiErrorMessage(error, "Данные не были сохранены."),
        placement: "bottomRight",
        duration: 3,
      });
    }
  };

  const worksColumns = [
    {
      title: "Наименование",
      dataIndex: "project_work_name",
      key: "project_work_name",
    },
    {
      title: "Работа из справочника",
      dataIndex: "work",
      key: "work",
      render: (workId: string) => worksMap[workId]?.name ?? workId,
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "120px",
    },
    {
      title: "Цена, ₽/шт.",
      dataIndex: "price",
      key: "price",
      width: "150px",
      render: formatPrice,
    },
  ];

  const materialsColumns = [
    {
      title: "Материал из справочника",
      dataIndex: "material",
      key: "material",
      render: (materialId: string) =>
        materialsMap[materialId]?.name ?? materialId,
    },
    {
      title: "Связанная работа",
      dataIndex: "project_work",
      key: "project_work",
      render: (projectWorkId?: string | null) =>
        parsedSpecification?.project_works.find(
          (work) => work.project_work_id === projectWorkId,
        )?.project_work_name ?? "—",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "120px",
    },
    {
      title: "Цена, ₽/шт.",
      dataIndex: "price",
      key: "price",
      width: "150px",
      render: formatPrice,
    },
  ];

  const unresolvedItems = parsedSpecification?.unresolved_items ?? [];
  const uploadedFileList: UploadFile[] = file
    ? [{ uid: "specification-file", name: file.name, status: "done" }]
    : [];

  return (
    <div className="import-project-works import-project-specification">
      <div className="import-project-works__body import-project-specification__body">
        <div className="import-project-works__sidebar">
          <div className="import-project-specification__step">
            <Typography.Text strong>1. Выберите файл</Typography.Text>
          </div>
          <Upload.Dragger
            accept=".csv,.xml,.json"
            maxCount={1}
            fileList={uploadedFileList}
            beforeUpload={beforeUpload}
            onRemove={removeFile}
            disabled={parseMutation.isPending || importMutation.isPending}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Перетащите файл спецификации</p>
            <p className="ant-upload-hint">Поддерживаются CSV, XML и JSON.</p>
          </Upload.Dragger>
          <Button
            className="import-project-works__analyze-button"
            type="primary"
            onClick={handleParse}
            disabled={!file || importMutation.isPending}
            loading={parseMutation.isPending}
          >
            Распознать с помощью ИИ
          </Button>
        </div>

        <div className="import-project-works__table-wrapper">
          {!parsedSpecification ? (
            <div className="import-project-specification__empty">
              <Space direction="vertical" size={4}>
                <Typography.Text strong>
                  2. Предпросмотр спецификации
                </Typography.Text>
                <Typography.Text type="secondary">
                  Выберите файл и запустите распознавание, чтобы увидеть
                  результат.
                </Typography.Text>
              </Space>
            </div>
          ) : (
            <Space
              direction="vertical"
              size="middle"
              className="import-project-specification__results"
            >
              <section>
                <Typography.Title level={5}>Работы</Typography.Title>
                <Table<IProjectSpecificationImportWork>
                  pagination={false}
                  rowKey="project_work_id"
                  dataSource={parsedSpecification.project_works}
                  columns={worksColumns}
                  size="small"
                  locale={{ emptyText: "Работы не распознаны" }}
                />
              </section>
              <section>
                <Typography.Title level={5}>Материалы</Typography.Title>
                <Table<IProjectSpecificationImportMaterial>
                  pagination={false}
                  rowKey="project_material_id"
                  dataSource={parsedSpecification.project_materials}
                  columns={materialsColumns}
                  size="small"
                  locale={{ emptyText: "Материалы не распознаны" }}
                />
              </section>
              {unresolvedItems.length > 0 && (
                <section>
                  <Typography.Title level={5}>
                    Не удалось сопоставить: {unresolvedItems.length}
                  </Typography.Title>
                  <Table
                    pagination={false}
                    rowKey={(_, index) => `unresolved-${index}`}
                    dataSource={unresolvedItems}
                    size="small"
                    columns={[
                      {
                        title: "Тип",
                        dataIndex: "kind",
                        render: (kind: string) =>
                          kind === "work" ? "Работа" : "Материал",
                        width: "120px",
                      },
                      { title: "Позиция", dataIndex: "name" },
                      { title: "Причина", dataIndex: "reason" },
                    ]}
                  />
                </section>
              )}
            </Space>
          )}
        </div>
      </div>
      <div className="import-project-works__footer import-project-specification__footer">
        <Space>
          <Button
            type="primary"
            onClick={handleImport}
            disabled={!importPayload || parseMutation.isPending}
            loading={importMutation.isPending}
          >
            Импортировать {parsedSpecification?.project_works.length ?? 0} работ
            и {parsedSpecification?.project_materials.length ?? 0} материалов
          </Button>
          <Button
            onClick={close}
            disabled={parseMutation.isPending || importMutation.isPending}
          >
            Закрыть
          </Button>
        </Space>
      </div>
    </div>
  );
};
