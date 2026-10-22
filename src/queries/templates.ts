import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplateParameters,
  fetchTemplateTypes,
  fetchTemplates,
  generateTemplate,
  updateTemplate,
} from "../api/templates.api";
import type {
  ITemplate,
  ITemplateType,
  ITemplateParametersResponse,
} from "../interfaces/templates/ITemplate";
import { createQueryKeys } from "../queryKeys";

export const templatesKeys = createQueryKeys("templates");

export const useTemplateTypesQuery = (
  enabled = true,
): UseQueryResult<ITemplateType[], Error> =>
  useQuery({
    queryKey: templatesKeys.list({ entity: "types" }),
    queryFn: fetchTemplateTypes,
    enabled,
  });

export const useTemplatesQuery = (
  templateType?: string,
): UseQueryResult<ITemplate[], Error> =>
  useQuery({
    queryKey: templatesKeys.list({ templateType }),
    queryFn: () => fetchTemplates(templateType as string),
    enabled: Boolean(templateType),
  });

export const useTemplateParametersQuery = (templateType?: string) =>
  useQuery<ITemplateParametersResponse, Error>({
    queryKey: templatesKeys.detail(`params-${templateType ?? ""}`),
    queryFn: () => fetchTemplateParameters(templateType as string),
    enabled: Boolean(templateType),
  });

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesKeys.all() }),
  });
};

export const useUpdateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTemplate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesKeys.all() }),
  });
};

export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesKeys.all() }),
  });
};

export const useGenerateTemplateMutation = () =>
  useMutation({ mutationFn: generateTemplate });
