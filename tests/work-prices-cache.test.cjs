const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const query = require("@tanstack/react-query");

function load(relative, imports = {}) {
  const filename = path.resolve(__dirname, relative);
  const loaded = new Module(filename, module);
  loaded.require = (name) => (name in imports ? imports[name] : require(name));
  loaded._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019,
      },
    }).outputText,
    filename,
  );
  return loaded.exports;
}
const { createQueryKeys } = load("../src/queryKeys/index.ts");
const worksKeys = createQueryKeys("works");
const cache = load("../src/queries/workPricesCache.ts", {
  "./works": { worksKeys },
});
const initialPrice = {
  work_price_id: "price",
  work: "one",
  category: 2,
  price: 100,
  deleted: false,
};
const works = [
  { work_id: "one", name: "Работа", work_prices: [initialPrice] },
  { work_id: "two", name: "Другая работа", work_prices: [] },
];

function setup(t) {
  const client = new query.QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  t.after(() => client.clear());
  let reads = 0;
  for (const [queryKey, data] of [
    [worksKeys.list(), works],
    [worksKeys.detail("one"), works[0]],
    [worksKeys.detail("two"), works[1]],
  ]) {
    client.setQueryData(queryKey, data, { updatedAt: 1 });
    const observer = new query.QueryObserver(client, {
      queryKey,
      queryFn: async () => {
        reads++;
        return data;
      },
    });
    t.after(observer.subscribe(() => {}));
  }
  return { client, reads: () => reads };
}

test("price edits update list/detail caches and preserve unrelated records without GET", async (t) => {
  const { client, reads } = setup(t);
  await cache.cacheSavedWorkPrice(client, { ...initialPrice, price: -1 });
  assert.equal(
    client.getQueryData(worksKeys.list())[0].work_prices[0].price,
    -1,
  );
  assert.equal(
    client.getQueryData(worksKeys.detail("one")).work_prices[0].price,
    -1,
  );
  assert.equal(client.getQueryData(worksKeys.list())[1], works[1]);
  assert.equal(client.getQueryState(worksKeys.detail("two")).dataUpdatedAt, 1);
  assert.equal(works[0].work_prices[0].price, 100);
  assert.equal(reads(), 0);
});

test("price creation, zeroing, category change and deletion update only the corresponding price", async (t) => {
  const { client, reads } = setup(t);
  const created = { work_price_id: "new", work: "one", category: 3, price: -1 };
  await cache.cacheSavedWorkPrice(client, created);
  await cache.cacheSavedWorkPrice(client, {
    ...created,
    category: 4,
    price: 0,
  });
  const prices = client.getQueryData(worksKeys.list())[0].work_prices;
  assert.equal(prices.length, 2);
  assert.equal(prices[0].work_price_id, "price");
  assert.equal(prices[1].category, 4);
  assert.equal(prices[1].price, 0);
  await cache.cacheDeletedWorkPrice(client, "new");
  assert.deepEqual(client.getQueryData(worksKeys.detail("one")).work_prices, [
    initialPrice,
  ]);
  assert.equal(reads(), 0);
});

test("moving a price between works removes its previous association", async (t) => {
  const { client, reads } = setup(t);
  await cache.cacheSavedWorkPrice(client, {
    ...initialPrice,
    work: "two",
    price: -1,
  });
  assert.equal(
    client.getQueryData(worksKeys.detail("one")).work_prices.length,
    0,
  );
  assert.equal(
    client.getQueryData(worksKeys.detail("two")).work_prices[0].work,
    "two",
  );
  assert.equal(reads(), 0);
});

test("an outdated list response cannot undo the price update", async (t) => {
  const { client } = setup(t);
  let resolve;
  const fetching = client
    .fetchQuery({
      queryKey: worksKeys.list(),
      staleTime: 0,
      queryFn: () =>
        new Promise((done) => {
          resolve = done;
        }),
    })
    .catch(() => undefined);
  await cache.cacheSavedWorkPrice(client, { ...initialPrice, price: -1 });
  resolve(works);
  await fetching;
  assert.equal(
    client.getQueryData(worksKeys.list())[0].work_prices[0].price,
    -1,
  );
});

test("unrelated pending detail requests are not cancelled or seeded with partial data", async (t) => {
  const { client } = setup(t);
  let resolve;
  const key = worksKeys.detail("new-work");
  const fetching = client.fetchQuery({
    queryKey: key,
    queryFn: () =>
      new Promise((done) => {
        resolve = done;
      }),
  });
  await cache.cacheSavedWorkPrice(client, { ...initialPrice, price: -1 });
  assert.equal(client.getQueryState(key).fetchStatus, "fetching");
  assert.equal(client.getQueryData(key), undefined);
  resolve({ work_id: "new-work", name: "Новая работа" });
  await fetching;
});

test("message-only API responses reconstruct the saved price and mutation hooks synchronize it", async (t) => {
  const { client, reads } = setup(t);
  const calls = [];
  const pricesApi = load("../src/api/work-prices.api.ts", {
    "./base": {
      apiClient: {
        post: async (url, payload) => {
          calls.push([url, payload]);
          return { data: { msg: "Created", work_price_id: "created" } };
        },
        patch: async (url, payload) => {
          calls.push([url, payload]);
          return { data: { msg: "Updated", work_price_id: "created" } };
        },
        delete: async (url) => {
          calls.push([url]);
        },
      },
    },
  });
  const hooks = load("../src/queries/workPrices.ts", {
    "@tanstack/react-query": {
      ...query,
      useMutation: (options) => options,
      useQueryClient: () => client,
    },
    "../queryKeys": { createQueryKeys },
    "../api/work-prices.api": pricesApi,
    "./workPricesCache": cache,
  });
  const payload = { work: "one", category: 3, price: -1 };
  const created = await new query.MutationObserver(
    client,
    hooks.useCreateWorkPriceMutation(),
  ).mutate(payload);
  assert.equal(created.work_price_id, "created");
  assert.equal(created.price, -1);
  assert.equal(
    client.getQueryData(worksKeys.list())[0].work_prices[1].price,
    -1,
  );
  await new query.MutationObserver(
    client,
    hooks.useUpdateWorkPriceMutation(),
  ).mutate({ workPriceId: "created", payload: { ...payload, price: 0 } });
  assert.equal(
    client.getQueryData(worksKeys.list())[0].work_prices[1].price,
    0,
  );
  await new query.MutationObserver(
    client,
    hooks.useDeleteWorkPriceMutation(),
  ).mutate({ workPriceId: "created", workId: "one" });
  assert.equal(client.getQueryData(worksKeys.list())[0].work_prices.length, 1);
  assert.equal(calls.length, 3);
  assert.equal(reads(), 0);
});

test("failed price writes do not alter work availability or refetch works", async (t) => {
  const { client, reads } = setup(t);
  const hooks = load("../src/queries/workPrices.ts", {
    "@tanstack/react-query": {
      ...query,
      useMutation: (options) => options,
      useQueryClient: () => client,
    },
    "../queryKeys": { createQueryKeys },
    "../api/work-prices.api": {
      updateWorkPrice: async () => {
        throw new Error("Save failed");
      },
    },
    "./workPricesCache": cache,
  });
  await assert.rejects(
    new query.MutationObserver(
      client,
      hooks.useUpdateWorkPriceMutation(),
    ).mutate({
      workPriceId: "price",
      payload: { ...initialPrice, price: -1 },
    }),
    /Save failed/,
  );
  assert.equal(client.getQueryData(worksKeys.list()), works);
  assert.equal(
    client.getQueryData(worksKeys.detail("one")).work_prices[0].price,
    100,
  );
  assert.equal(reads(), 0);
});
