import { FileExcelOutlined } from "@ant-design/icons";
import { Button } from "antd";
import * as React from "react";
import type { IWorksList } from "../../../interfaces/works/IWorksList";

interface IExportProps {
  works: IWorksList[];
}

export const WorksExport = ({ works }: IExportProps) => {
  const exportedData = React.useMemo(() => {
    const activeWorks = works.filter((work) => !work.deleted);
    const formatPrice = (work: IWorksList, category: number) => {
      const price = work.work_prices?.find(
        (item) => item.category === category,
      )?.price;
      return typeof price === "number"
        ? price.toString().replace(".", ",")
        : "";
    };

    return activeWorks.map((work) => ({
      id: work.work_id ?? "",
      name: work.name ?? "",
      category: work.category?.name ?? "",
      measurement_unit: work.measurement_unit ?? "",
      price1: formatPrice(work, 1),
      price2: formatPrice(work, 2),
      price3: formatPrice(work, 3),
      price4: formatPrice(work, 4),
    }));
  }, [works]);

  const handleExport = React.useCallback(() => {
    if (!exportedData.length) {
      return;
    }

    const headers = [
      "id",
      "Наименование",
      "Категория",
      "Единица измерения",
      "Цена 1",
      "Цена 2",
      "Цена 3",
      "Цена 4",
    ].join(";");

    const rows = exportedData
      .map((row) =>
        [
          row.id,
          row.name,
          row.category,
          row.measurement_unit,
          row.price1,
          row.price2,
          row.price3,
          row.price4,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\r\n");

    const csvContent = "\uFEFF" + headers + "\r\n" + rows;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "works.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportedData]);

  return (
    <Button
      icon={<FileExcelOutlined />}
      onClick={handleExport}
      disabled={!exportedData.length}
    >
      Экспорт CSV
    </Button>
  );
};
