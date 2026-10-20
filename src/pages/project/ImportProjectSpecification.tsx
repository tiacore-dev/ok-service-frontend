import * as React from "react";
import {
  Button,
  InputNumber,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { IProject } from "../../interfaces/projects/IProject";
import type {
  IProjectSpecificationImportMaterial,
  IProjectSpecificationImportPayload,
  IProjectSpecificationImportWork,
  IProjectSpecificationParseResult,
  IProjectSpecificationUnresolvedItem,
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

const SUPPORTED_FILE_EXTENSIONS = ["csv", "xml", "json", "xlsx"];

const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase();

const formatPrice = (price?: number | null) =>
  price == null ? "—" : formatNumber(price);

interface UnresolvedItemRow extends IProjectSpecificationUnresolvedItem {
  key: string;
}

interface UnresolvedItemDraft {
  id: string;
  catalogId?: string;
  quantity?: number;
  price?: number;
  projectWorkId?: string;
}

export const ImportProjectSpecification: React.FC<
  ImportProjectSpecificationProps
> = ({ project, close }) => {
  const notificationApi = React.useContext(NotificationContext);
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedSpecification, setParsedSpecification] =
    React.useState<IProjectSpecificationParseResult | null>(null);
  const [unresolvedDrafts, setUnresolvedDrafts] = React.useState<
    Record<string, UnresolvedItemDraft>
  >({});
  const { works, worksMap } = useWorksMap();
  const { materials } = useMaterialsMap();
  const parseMutation = useParseProjectSpecificationMutation();
  const importMutation = useImportProjectWorksAndMaterialsMutation();

  const beforeUpload: UploadProps["beforeUpload"] = (nextFile) => {
    const extension = getFileExtension(nextFile.name);
    if (!extension || !SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
      notificationApi?.error({
        message: "Неподдерживаемый формат",
        description: "Выберите файл в формате CSV, XML, JSON или XLSX.",
        placement: "bottomRight",
        duration: 3,
      });
      return Upload.LIST_IGNORE;
    }

    setFile(nextFile as File);
    setParsedSpecification(null);
    setUnresolvedDrafts({});
    return false;
  };

  const removeFile = () => {
    setFile(null);
    setParsedSpecification(null);
    setUnresolvedDrafts({});
  };

  const handleParse = async () => {
    if (!file) {
      return;
    }

    try {
      const result = await parseMutation.mutateAsync(file);
      setParsedSpecification(result);
      setUnresolvedDrafts(
        (result.unresolved_items ?? []).reduce<
          Record<string, UnresolvedItemDraft>
        >((drafts, item, index) => {
          drafts[`unresolved-${index}`] = {
            // Keep the import ID stable when editing this row or linking materials.
            id: crypto.randomUUID(),
            ...(item.quantity == null ? {} : { quantity: item.quantity }),
            ...(item.price == null ? {} : { price: item.price }),
            ...(item.kind !== "material" || item.project_work == null
              ? {}
              : { projectWorkId: item.project_work }),
          };
          return drafts;
        }, {}),
      );
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

  const unresolvedRows = React.useMemo<UnresolvedItemRow[]>(
    () =>
      (parsedSpecification?.unresolved_items ?? []).map((item, index) => ({
        ...item,
        key: `unresolved-${index}`,
      })),
    [parsedSpecification],
  );

  const updateUnresolvedDraft = React.useCallback(
    (key: string, patch: Partial<UnresolvedItemDraft>) => {
      setUnresolvedDrafts((current) => ({
        ...current,
        [key]: { ...current[key], ...patch },
      }));
    },
    [],
  );

  const resolvedUnresolvedWorks = React.useMemo<
    IProjectSpecificationImportWork[]
  >(
    () =>
      unresolvedRows.flatMap((item) => {
        const draft = unresolvedDrafts[item.key];
        if (
          item.kind !== "work" ||
          !draft?.catalogId ||
          !draft.quantity ||
          draft.quantity <= 0
        ) {
          return [];
        }

        return [
          {
            project_work_id: draft.id,
            project_work_name: item.name,
            work: draft.catalogId,
            quantity: draft.quantity,
            ...(draft.price === undefined ? {} : { price: draft.price }),
          },
        ];
      }),
    [unresolvedDrafts, unresolvedRows],
  );

  const linkedWorkOptions = React.useMemo(() => {
    const parsedWorks = parsedSpecification?.project_works ?? [];
    return [...parsedWorks, ...resolvedUnresolvedWorks].map((work) => ({
      label: work.project_work_name,
      value: work.project_work_id,
    }));
  }, [parsedSpecification?.project_works, resolvedUnresolvedWorks]);

  const resolvedUnresolvedMaterials = React.useMemo<
    IProjectSpecificationImportMaterial[]
  >(
    () =>
      unresolvedRows.flatMap((item) => {
        const draft = unresolvedDrafts[item.key];
        if (
          item.kind !== "material" ||
          !draft?.catalogId ||
          !draft.quantity ||
          draft.quantity <= 0
        ) {
          return [];
        }

        return [
          {
            project_material_id: draft.id,
            project_material_name: item.name,
            material: draft.catalogId,
            quantity: draft.quantity,
            ...(draft.price === undefined ? {} : { price: draft.price }),
            ...(draft.projectWorkId === undefined
              ? {}
              : { project_work: draft.projectWorkId }),
          },
        ];
      }),
    [unresolvedDrafts, unresolvedRows],
  );

  const importPayload =
    React.useMemo<IProjectSpecificationImportPayload | null>(() => {
      if (!parsedSpecification) {
        return null;
      }

      return {
        project_works: [
          ...parsedSpecification.project_works.map((work) => ({
            ...work,
            ...(work.price == null ? { price: undefined } : {}),
          })),
          ...resolvedUnresolvedWorks,
        ],
        project_materials: [
          ...parsedSpecification.project_materials.map((material) => ({
            ...material,
            ...(material.price == null ? { price: undefined } : {}),
            ...(material.project_work == null
              ? { project_work: undefined }
              : {}),
          })),
          ...resolvedUnresolvedMaterials,
        ],
      };
    }, [
      parsedSpecification,
      resolvedUnresolvedMaterials,
      resolvedUnresolvedWorks,
    ]);

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
      title: "Наименование материала",
      dataIndex: "project_material_name",
      key: "project_material_name",
      render: (value: string | undefined) => value ?? "—",
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

  const workOptions = React.useMemo(
    () =>
      works
        .filter((work) => !work.deleted && Boolean(work.work_id))
        .map((work) => ({ label: work.name, value: work.work_id! })),
    [works],
  );

  const materialOptions = React.useMemo(
    () =>
      materials
        .filter(
          (material) => !material.deleted && Boolean(material.material_id),
        )
        .map((material) => ({
          label: material.name,
          value: material.material_id!,
        })),
    [materials],
  );

  const unresolvedItems = parsedSpecification?.unresolved_items ?? [];
  const uploadedFileList: UploadFile[] = file
    ? [{ uid: "specification-file", name: file.name, status: "done" }]
    : [];

  return (
    <div
      className={`import-project-works import-project-specification${
        parsedSpecification ? " import-project-specification--parsed" : ""
      }`}
    >
      <div className="import-project-works__body import-project-specification__body">
        {!parsedSpecification && (
          <div className="import-project-works__sidebar">
            <div className="import-project-specification__step">
              <Typography.Text strong>1. Выберите файл</Typography.Text>
            </div>
            <Upload.Dragger
              accept=".csv,.xml,.json,.xlsx"
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
              <p className="ant-upload-hint">
                Поддерживаются CSV, XML, JSON и XLSX.
              </p>
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
        )}

        <div className="import-project-works__table-wrapper">
          {parseMutation.isPending ? (
            <div className="import-project-specification__processing">
              <Spin size="large" />
              <Typography.Title level={5}>
                ИИ распознаёт спецификацию
              </Typography.Title>
              <Typography.Text type="secondary">
                Это может занять несколько минут. Не покидайте страницу до
                завершения обработки.
              </Typography.Text>
            </div>
          ) : !parsedSpecification ? (
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
                    Не удалось сопоставить: {unresolvedRows.length}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary">
                    Выберите позицию из справочника и заполните количество.
                    Исправленные строки будут добавлены в импорт.
                  </Typography.Paragraph>
                  <div className="import-project-specification__unresolved-list">
                    {unresolvedRows.map((record) => {
                      const draft = unresolvedDrafts[record.key];
                      const isWork = record.kind === "work";

                      return (
                        <article
                          key={record.key}
                          className="import-project-specification__unresolved-item"
                        >
                          <div className="import-project-specification__unresolved-info">
                            <Typography.Text type="secondary">
                              {isWork ? "Работа" : "Материал"}
                            </Typography.Text>
                            <Typography.Text strong>
                              {record.name}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {record.reason}
                            </Typography.Text>
                          </div>
                          <div className="import-project-specification__unresolved-fields">
                            <Select
                              allowClear
                              showSearch
                              optionFilterProp="label"
                              placeholder={
                                isWork
                                  ? "Выберите работу из справочника"
                                  : "Выберите материал из справочника"
                              }
                              options={isWork ? workOptions : materialOptions}
                              value={draft?.catalogId}
                              onChange={(catalogId?: string) =>
                                updateUnresolvedDraft(record.key, {
                                  catalogId,
                                })
                              }
                              className="import-project-specification__catalog-field"
                            />
                            <InputNumber
                              min={0.0001}
                              precision={4}
                              placeholder="Количество *"
                              value={draft?.quantity}
                              onChange={(quantity) =>
                                updateUnresolvedDraft(record.key, {
                                  quantity:
                                    quantity === null ? undefined : quantity,
                                })
                              }
                              className="import-project-specification__number-field"
                            />
                            <InputNumber
                              min={0}
                              precision={2}
                              placeholder="Цена, ₽/шт."
                              value={draft?.price}
                              onChange={(price) =>
                                updateUnresolvedDraft(record.key, {
                                  price: price === null ? undefined : price,
                                })
                              }
                              className="import-project-specification__number-field"
                            />
                            {!isWork && (
                              <Select
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                placeholder="Связать с работой"
                                options={linkedWorkOptions}
                                value={draft?.projectWorkId}
                                onChange={(projectWorkId?: string) =>
                                  updateUnresolvedDraft(record.key, {
                                    projectWorkId,
                                  })
                                }
                                className="import-project-specification__work-field"
                              />
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
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
            Импортировать {importPayload?.project_works.length ?? 0} работ и{" "}
            {importPayload?.project_materials.length ?? 0} материалов
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
