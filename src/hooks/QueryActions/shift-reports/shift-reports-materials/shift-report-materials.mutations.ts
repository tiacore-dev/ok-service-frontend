import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IShiftReportMaterial } from "../../../../interfaces/shiftReportMaterials/IShiftReportMaterial";
import {
  createShiftReportMaterialApi,
  deleteShiftReportMaterialApi,
  editShiftReportMaterialApi,
} from "../../../../api/shift-report-materials.api";

export type EditableShiftReportMaterial = Omit<
  IShiftReportMaterial,
  "shift_report_material_id"
>;

export const useCreateShiftReportMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditableShiftReportMaterial) =>
      createShiftReportMaterialApi(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReportMaterials", variables.shift_report],
      });
    },
  });
};

export const useEditShiftReportMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EditableShiftReportMaterial;
    }) => editShiftReportMaterialApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReportMaterials", variables.data.shift_report],
      });
    },
  });
};

export const useDeleteShiftReportMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; shiftReportId: string }) =>
      deleteShiftReportMaterialApi(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["shiftReportMaterials", variables.shiftReportId],
      });
    },
  });
};
