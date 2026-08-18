import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import {
  addProjectPlaceRelations,
  deleteProjectPlaceRelations,
  fetchProjectPlaceRelations,
  deleteProjectPlaceRelation,
  type ProjectPlaceRelationsBulkPayload,
} from "../api/project-place-relations.api";

export const projectPlaceRelationsKeys = createQueryKeys(
  "projectPlaceRelations",
);

export const useProjectPlaceRelationsQuery = () =>
  useQuery({
    queryKey: projectPlaceRelationsKeys.list(),
    queryFn: fetchProjectPlaceRelations,
  });

export const useAddProjectPlaceRelationsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProjectPlaceRelations,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectPlaceRelationsKeys.list(),
      });
    },
  });
};

export const useDeleteProjectPlaceRelationsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPlaceRelationsBulkPayload) =>
      deleteProjectPlaceRelations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectPlaceRelationsKeys.list(),
      });
    },
  });
};

export const useDeleteProjectPlaceRelationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectPlaceRelation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectPlaceRelationsKeys.list() }),
  });
};
