import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  type UploadProps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { NotificationContext } from "../../../contexts/NotificationContext";
import type { IWorksList } from "../../../interfaces/works/IWorksList";
import {
  useUpdateWorkPriceMutation,
  workPricesKeys,
} from "../../../queries/workPrices";
import { worksKeys } from "../../../queries/works";
import { useQueryClient } from "@tanstack/react-query";
import "./import.less";

const { Dragger } = Upload;

const PRICE_CATEGORIES = [1, 2, 3, 4] as const;
type PriceCategory = (typeof PRICE_CATEGORIES)[number];
type PriceMap = Record<PriceCategory, number | null>;
type PriceIdMap = Record<PriceCategory, string | undefined>;

type StatusType = "success" | "warning" | "error" | "info";

interface ImportChange {
  category: PriceCategory;
  currentPrice: number | null;
  nextPrice: number;
  workPriceId?: string;
  canUpdate: boolean;
}

interface ImportRow {
  key: string;
  workId: string;
  name: string;
  categoryName: string;
  measurementUnit: string;
  newPrices: PriceMap;
  currentPrices: PriceMap;
  priceIds: PriceIdMap;
  changes: ImportChange[];
  status: string;
  statusType: StatusType;
}

interface IImportWorksProps {
  works: IWorksList[];
  onClose: () => void;
}

const buildEmptyPriceMap = (): PriceMap =>
  PRICE_CATEGORIES.reduce<PriceMap>((acc, category) => {
    acc[category] = null;
    return acc;
  }, {} as PriceMap);

const splitCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ";" && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
};

const parsePriceValue = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const normalized = value
    .replace(/^\uFEFF/, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCsvContent = (
  content: string,
  worksById: Record<string, IWorksList>,
): ImportRow[] => {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  if (!lines.length) {
    return [];
  }

  const dataLines =
    lines[0].toLowerCase().includes("id") && lines.length > 1
      ? lines.slice(1)
      : lines;

  return dataLines
    .map((line, index) => {
      const cells = splitCsvLine(line).map((cell) =>
        cell
          .replace(/^\uFEFF/, "")
          .replace(/""/g, '"')
          .trim(),
      );

      if (!cells.length || cells.every((cell) => cell === "")) {
        return null;
      }

      const workId = cells[0]?.trim() ?? "";
      const name = cells[1]?.trim() ?? "";
      const categoryName = cells[2]?.trim() ?? "";
      const measurementUnit = cells[3]?.trim() ?? "";

      const work = workId ? worksById[workId] : undefined;

      const newPrices = PRICE_CATEGORIES.reduce<PriceMap>(
        (acc, category, priceIndex) => {
          acc[category] = parsePriceValue(cells[4 + priceIndex]);
          return acc;
        },
        buildEmptyPriceMap(),
      );

      const currentPrices =
        work?.work_prices?.reduce<PriceMap>((acc, price) => {
          const category = price.category as PriceCategory;
          acc[category] = Number.isFinite(price.price)
            ? price.price
            : acc[category];
          return acc;
        }, buildEmptyPriceMap()) ?? buildEmptyPriceMap();

      const priceIds =
        work?.work_prices?.reduce<PriceIdMap>((acc, price) => {
          const category = price.category as PriceCategory;
          acc[category] = price.work_price_id;
          return acc;
        }, {} as PriceIdMap) ?? ({} as PriceIdMap);

      const changes = PRICE_CATEGORIES.reduce<ImportChange[]>(
        (acc, category) => {
          const nextPrice = newPrices[category];
          const currentPrice = currentPrices[category];
          const workPriceId = priceIds[category];

          if (nextPrice === null || nextPrice === undefined) {
            return acc;
          }

          if (currentPrice === nextPrice) {
            return acc;
          }

          acc.push({
            category,
            currentPrice,
            nextPrice,
            workPriceId,
            canUpdate: Boolean(workPriceId),
          });

          return acc;
        },
        [],
      );

      let status = "Готово к обновлению";
      let statusType: StatusType = "success";

      if (!workId || !work) {
        status = "Работа не найдена по id";
        statusType = "error";
      } else if (!changes.length) {
        status = "Изменений нет";
        statusType = "info";
      } else if (changes.some((change) => !change.canUpdate)) {
        const categoriesWithoutPrice = changes
          .filter((change) => !change.canUpdate)
          .map((change) => change.category)
          .join(", ");
        status = `Нет текущей цены для разрядов: ${categoriesWithoutPrice}`;
        statusType = "warning";
      }

      return {
        key: `${index}-${workId || "empty"}`,
        workId,
        name: work?.name ?? name,
        categoryName: work?.category?.name ?? categoryName,
        measurementUnit: work?.measurement_unit ?? measurementUnit,
        newPrices,
        currentPrices,
        priceIds,
        changes,
        status,
        statusType,
      };
    })
    .filter((row): row is ImportRow => Boolean(row));
};

const formatPrice = (price: number | null | undefined) =>
  typeof price === "number" ? price : "-";

const renderPriceChange = (row: ImportRow, category: PriceCategory) => {
  const current = row.currentPrices[category];
  const next = row.newPrices[category];

  if (next === null || next === undefined) {
    return <>{formatPrice(current)}</>;
  }

  if (current === next) {
    return <>{formatPrice(current)}</>;
  }

  return (
    <span>
      {formatPrice(current)} →{" "}
      <Typography.Text strong>{formatPrice(next)}</Typography.Text>
    </span>
  );
};

export const ImportWorks = ({ works, onClose }: IImportWorksProps) => {
  const notificationApi = useContext(NotificationContext);
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const updateWorkPriceMutation = useUpdateWorkPriceMutation();

  const worksById = useMemo(() => {
    return works.reduce<Record<string, IWorksList>>((acc, work) => {
      if (work.work_id) {
        acc[work.work_id] = work;
      }
      return acc;
    }, {});
  }, [works]);

  const readyUpdates = useMemo(
    () =>
      rows.flatMap((row) =>
        row.changes
          .filter((change) => change.canUpdate && row.workId)
          .map((change) => ({
            workPriceId: change.workPriceId as string,
            payload: {
              work: row.workId,
              category: change.category,
              price: change.nextPrice,
            },
          })),
      ),
    [rows],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessingFile(true);
      try {
        const content = await file.text();
        const parsedRows = parseCsvContent(content, worksById);
        setRows(parsedRows);
        setFileName(file.name);

        if (!parsedRows.length) {
          notificationApi?.warning({
            message: "Файл не содержит данных",
            description: "Не удалось распознать строки для импорта",
            placement: "bottomRight",
            duration: 2,
          });
        }
      } catch (error) {
        const description =
          error instanceof Error ? error.message : "Не удалось прочитать файл";
        notificationApi?.error({
          message: "Ошибка загрузки файла",
          description,
          placement: "bottomRight",
          duration: 2,
        });
      } finally {
        setIsProcessingFile(false);
      }
    },
    [notificationApi, worksById],
  );

  const uploadProps: UploadProps = useMemo(
    () => ({
      name: "file",
      accept: ".csv,text/csv",
      multiple: false,
      showUploadList: false,
      beforeUpload: (file) => {
        void handleFile(file);
        return false;
      },
    }),
    [handleFile],
  );

  const handleApply = useCallback(async () => {
    if (!readyUpdates.length) {
      notificationApi?.warning({
        message: "Нет изменений",
        description:
          "В загруженном файле нет цен, отличающихся от текущих данных",
        placement: "bottomRight",
        duration: 2,
      });
      return;
    }

    setIsUpdating(true);
    const errors: string[] = [];

    for (const update of readyUpdates) {
      try {
        await updateWorkPriceMutation.mutateAsync(update);
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : `Не удалось обновить цену ${update.payload.work}`;
        errors.push(description);
      }
    }

    setIsUpdating(false);

    if (errors.length) {
      notificationApi?.error({
        message: "Обновление завершено с ошибками",
        description: errors.slice(0, 3).join("; "),
        placement: "bottomRight",
        duration: 3,
      });
      return;
    }

    notificationApi?.success({
      message: "Цены обновлены",
      description: `Изменено значений: ${readyUpdates.length}`,
      placement: "bottomRight",
      duration: 2,
    });

    queryClient.invalidateQueries({ queryKey: worksKeys.all() });
    queryClient.invalidateQueries({ queryKey: workPricesKeys.all() });

    onClose();
  }, [notificationApi, onClose, readyUpdates, updateWorkPriceMutation]);

  const columns: ColumnsType<ImportRow> = [
    { title: "id", dataIndex: "workId", key: "workId", width: 120 },
    {
      title: "Наименование",
      dataIndex: "name",
      key: "name",
      width: 240,
      render: (text: string) => (
        <Typography.Text className="works-import__text-normal">
          {text}
        </Typography.Text>
      ),
    },
    { title: "Категория", dataIndex: "categoryName", key: "categoryName" },
    {
      title: "Ед. изм.",
      dataIndex: "measurementUnit",
      key: "measurementUnit",
      width: 120,
    },
    {
      title: "Цена 1",
      key: "price1",
      render: (_: string, row: ImportRow) => renderPriceChange(row, 1),
    },
    {
      title: "Цена 2",
      key: "price2",
      render: (_: string, row: ImportRow) => renderPriceChange(row, 2),
    },
    {
      title: "Цена 3",
      key: "price3",
      render: (_: string, row: ImportRow) => renderPriceChange(row, 3),
    },
    {
      title: "Цена 4",
      key: "price4",
      render: (_: string, row: ImportRow) => renderPriceChange(row, 4),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (_: string, row: ImportRow) => {
        const colorMap: Record<StatusType, string> = {
          success: "green",
          warning: "orange",
          error: "red",
          info: "blue",
        };
        return <Tag color={colorMap[row.statusType]}>{row.status}</Tag>;
      },
    },
  ];

  const changesCounter = useMemo(
    () => rows.reduce((acc, row) => acc + row.changes.length, 0),
    [rows],
  );

  return (
    <div className="works-import">
      <Space
        direction="vertical"
        size="large"
        className="works-import__content"
      >
        <div>
          <Typography.Title level={4} className="works-import__title">
            Импорт цен работ
          </Typography.Title>
          <Typography.Paragraph className="works-import__paragraph">
            Загрузите CSV, полученный через экспорт работ. Меняем только столбцы
            «Цена 1-4» — остальные данные используются для поиска работы.
          </Typography.Paragraph>
        </div>

        <Dragger {...uploadProps} disabled={isProcessingFile || isUpdating}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Перетащите файл или выберите его вручную
          </p>
          <p className="ant-upload-hint">
            Формат: CSV со столбцами id, Наименование, Категория, Единица
            измерения, Цена 1-4
          </p>
        </Dragger>

        {fileName && (
          <Typography.Text>
            Загружен файл: <strong>{fileName}</strong>. Найдено строк:{" "}
            {rows.length}. Обнаружено изменений: {changesCounter}
          </Typography.Text>
        )}

        <Table
          size="small"
          pagination={false}
          scroll={{ x: true, y: 400 }}
          dataSource={rows}
          columns={columns}
          rowKey="key"
          loading={isProcessingFile}
        />

        <Space>
          <Button
            type="primary"
            onClick={handleApply}
            loading={isUpdating}
            disabled={isProcessingFile || !readyUpdates.length}
          >
            Обновить цены ({readyUpdates.length})
          </Button>
          <Button onClick={onClose} disabled={isUpdating}>
            Закрыть
          </Button>
        </Space>
      </Space>
    </div>
  );
};
