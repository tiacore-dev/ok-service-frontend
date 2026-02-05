"use client";

import * as React from "react";
import { FileExcelOutlined, LoadingOutlined } from "@ant-design/icons";
import { useObjectsMap } from "../../../../queries/objects";
import { useProjectsMap } from "../../../../queries/projects";
import { dateTimestampToLocalString } from "../../../../utils/dateConverter";
import { useShiftReportsQuery } from "../../../../hooks/QueryActions/shift-reports/shift-reports.query";
import { fetchShiftReportDetails } from "../../../../api/shift-report-details.api";
import { fetchShiftReportMaterials } from "../../../../api/shift-report-materials.api";
import { generateObjectVolumeReport } from "../../../../api/object-volume-report.api";
import { useMaterialsMap } from "../../../../queries/materials";
import type {
  IObjectVolumeReport,
  IObjectVolumeReportObject,
  IObjectVolumeReportProject,
  IObjectVolumeReportProjectDetail,
} from "../../../../interfaces/reports/IObjectVolumeReport";
import type { IPopulatedShiftReportDetail } from "../../../../interfaces/shiftReportDetails/IShiftReportDetail";
import type { IShiftReportMaterialsList } from "../../../../interfaces/shiftReportMaterials/IShiftReportMaterialsList";

interface DownloadObjectVolumeReportProps {
  currentFilters?: {
    users?: string[];
    projects?: string[];
    date_from?: number;
    date_to?: number;
  };
}

export const useDownloadObjectVolumeReport = ({
  currentFilters,
}: DownloadObjectVolumeReportProps) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: shiftReportsResponse } = useShiftReportsQuery({
    user: currentFilters?.users,
    project: currentFilters?.projects,
    date_from: currentFilters?.date_from ?? undefined,
    date_to: currentFilters?.date_to ?? undefined,
    offset: 0,
    limit: 10000,
  });

  const shiftReportsData = shiftReportsResponse?.shift_reports || [];
  const { projectsMap } = useProjectsMap();
  const { objectsMap } = useObjectsMap();
  const { materialsMap } = useMaterialsMap();
  const createObjectVolumeReport =
    React.useCallback(async (): Promise<IObjectVolumeReport> => {
      const reportData: IObjectVolumeReport = {
        date_from: dateTimestampToLocalString(currentFilters?.date_from) || "",
        date_to: dateTimestampToLocalString(currentFilters?.date_to) || "",
        objects: [],
      };

      const objectsMapLocal: Record<string, IObjectVolumeReportObject> = {};

      const params: Record<string, string> = {
        limit: "10000",
      };

      if (currentFilters?.date_from) {
        params.date_from = String(currentFilters.date_from);
      }

      if (currentFilters?.date_to) {
        params.date_to = String(currentFilters.date_to);
      }

      if (currentFilters?.users?.length) {
        params.user = currentFilters.users.join(",");
      }

      if (currentFilters?.projects?.length) {
        params.project = currentFilters.projects.join(",");
      }

      let details: IPopulatedShiftReportDetail[] = [];
      let materials: IShiftReportMaterialsList[] = [];

      try {
        const detailsResponse = await fetchShiftReportDetails(params);
        details = (detailsResponse.shift_report_details ||
          []) as IPopulatedShiftReportDetail[];
      } catch (error) {
        console.error("Ошибка при загрузке деталей отчетов:", error);
      }

      try {
        const materialsResponse = await fetchShiftReportMaterials(params);
        materials = materialsResponse.shift_report_materials || [];
      } catch (error) {
        console.error("Ошибка при загрузке материалов отчетов:", error);
      }

      if (details.length === 0 && materials.length === 0) {
        return reportData;
      }

      const detailsByShiftReportId = details.reduce(
        (acc: Record<string, IPopulatedShiftReportDetail[]>, detail) => {
          if (!detail?.shift_report) {
            return acc;
          }

          if (!acc[detail.shift_report]) {
            acc[detail.shift_report] = [];
          }

          acc[detail.shift_report].push(detail);
          return acc;
        },
        {},
      );

      const materialsByShiftReportId = materials.reduce(
        (acc: Record<string, IShiftReportMaterialsList[]>, material) => {
          if (!material?.shift_report) {
            return acc;
          }

          if (!acc[material.shift_report]) {
            acc[material.shift_report] = [];
          }

          acc[material.shift_report].push(material);
          return acc;
        },
        {},
      );

      const projectDataById: Record<string, IObjectVolumeReportProject> = {};
      const projectDetailsAccumulator: Record<
        string,
        {
          work: Map<string, IObjectVolumeReportProjectDetail>;
          material: Map<string, IObjectVolumeReportProjectDetail>;
        }
      > = {};

      const ensureProjectData = (params: {
        objectName: string;
        projectName: string;
        projectId: string;
      }) => {
        const { objectName, projectName, projectId } = params;

        let objectData = objectsMapLocal[objectName];
        if (!objectData) {
          objectData = {
            name: objectName,
            projects: [],
          };
          objectsMapLocal[objectName] = objectData;
          reportData.objects.push(objectData);
        }

        let projectData = projectDataById[projectId];
        if (!projectData) {
          projectData = {
            name: projectName,
            project_details: [],
          };
          projectDataById[projectId] = projectData;
          objectData.projects.push(projectData);
        } else if (!objectData.projects.includes(projectData)) {
          objectData.projects.push(projectData);
        }

        if (!projectDetailsAccumulator[projectId]) {
          projectDetailsAccumulator[projectId] = {
            work: new Map(),
            material: new Map(),
          };
        }

        return {
          objectData,
          projectData,
          accumulator: projectDetailsAccumulator[projectId],
        };
      };

      for (const report of shiftReportsData) {
        const shiftReportId = report.shift_report_id as string;
        const reportDetails = detailsByShiftReportId[shiftReportId] || [];
        const reportMaterials = materialsByShiftReportId[shiftReportId] || [];

        if (reportDetails.length === 0 && reportMaterials.length === 0) {
          continue;
        }

        const project = projectsMap[report.project];
        if (!project) continue;

        const objectName =
          objectsMap[project.object]?.name || "Неизвестный объект";
        const projectName = project.name || "Неизвестный проект";

        const { accumulator } = ensureProjectData({
          objectName,
          projectName,
          projectId: report.project as string,
        });

        for (const detail of reportDetails) {
          const projectDetailName = detail.project_work.name;
          let projectDetail = accumulator.work.get(projectDetailName);

          if (!projectDetail) {
            projectDetail = {
              name: projectDetailName,
              quantity: 0,
            };
            accumulator.work.set(projectDetailName, projectDetail);
          }

          projectDetail.quantity += detail.quantity;
        }

        for (const material of reportMaterials) {
          const materialName =
            materialsMap[material.material]?.name || "Неизвестный материал";
          let materialDetail = accumulator.material.get(materialName);

          if (!materialDetail) {
            materialDetail = {
              name: materialName,
              quantity: 0,
            };
            accumulator.material.set(materialName, materialDetail);
          }

          materialDetail.quantity += material.quantity;
        }
      }

      for (const [projectId, accumulator] of Object.entries(
        projectDetailsAccumulator,
      )) {
        const projectData = projectDataById[projectId];
        if (!projectData) {
          continue;
        }

        const workDetails = Array.from(accumulator.work.values());
        const workTitle: IObjectVolumeReportProjectDetail[] =
          workDetails.length > 0 ? [{ name: "Работы:", quantity: null }] : [];
        const materialDetails = Array.from(accumulator.material.values());
        const materialTitle: IObjectVolumeReportProjectDetail[] =
          materialDetails.length > 0
            ? [{ name: "Материалы:", quantity: null }]
            : [];

        projectData.project_details = [
          ...workTitle,
          ...workDetails,
          ...materialTitle,
          ...materialDetails,
        ];
      }

      return reportData;
    }, [
      currentFilters?.date_from,
      currentFilters?.date_to,
      currentFilters?.projects,
      currentFilters?.users,
      materialsMap,
      objectsMap,
      projectsMap,
      shiftReportsData,
    ]);

  const handleDownload = async (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  const exportToXLSX = React.useCallback(async () => {
    try {
      setIsExporting(true);
      const reportData = await createObjectVolumeReport();

      const dateFrom =
        dateTimestampToLocalString(currentFilters?.date_from) || "";
      const dateTo = dateTimestampToLocalString(currentFilters?.date_to) || "";
      const fileName =
        `object_volume_report_${dateFrom}_${dateTo}.xlsx`.replace(/\s+/g, "_");
      const reportName = `object_volume_report_${dateFrom}_${dateTo}`.replace(
        /\s+/g,
        "_",
      );

      const blob = await generateObjectVolumeReport(reportData, reportName);

      await handleDownload(blob, fileName);
    } catch (error) {
      console.error("Ошибка при экспорте отчета по объектам:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    createObjectVolumeReport,
    currentFilters?.date_from,
    currentFilters?.date_to,
  ]);

  const disabled =
    shiftReportsData.length === 0 ||
    !currentFilters?.date_from ||
    !currentFilters?.date_to;

  return {
    disabled,
    tooltipTitle: "Для скачивания отчета необходимо выбрать фильтры по дате",
    icon: isExporting ? <LoadingOutlined /> : <FileExcelOutlined />,
    label: "Отчет по объектам",
    onClick: exportToXLSX,
  };
};
