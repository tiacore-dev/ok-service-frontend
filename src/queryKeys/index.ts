export type QueryKey = readonly unknown[];

export interface ListParams {
  [key: string]: unknown;
}

export const createQueryKeys = <Scope extends string>(scope: Scope) => ({
  all: () => [scope] as const,
  list: (params?: ListParams) =>
    params ? ([scope, "list", params] as const) : ([scope, "list"] as const),
  detail: <Identifier>(id: Identifier) => [scope, "detail", id] as const,
  infinite: (params?: ListParams) =>
    params
      ? ([scope, "infinite", params] as const)
      : ([scope, "infinite"] as const),
});

export const queryKeys = {
  app: () => ["app"] as const,
};
