const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const {
  QueryClient,
  QueryObserver,
  MutationObserver,
} = require("@tanstack/react-query");

function loadTypeScript(relativePath, imports = {}) {
  const filename = path.resolve(__dirname, relativePath);
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
const { createQueryKeys } = loadTypeScript("../src/queryKeys/index.ts");
const worksKeys = createQueryKeys("works");
const workCategoriesKeys = createQueryKeys("workCategories");
const { buildWorksTree } = loadTypeScript("../src/utils/workCategoryTree.ts");
const category = (id, parent_id = null) => ({
  work_category_id: id,
  name: id,
  parent_id,
});
const categories = [
  category("A"),
  category("B"),
  category("child", "A"),
  category("grandchild", "child"),
];
const work = (id, categoryIndex) => ({
  work_id: id,
  name: id,
  category: categories[categoryIndex],
  measurement_unit: { name: "м²" },
  work_prices: [{ category: 1, price: 100 }],
});
const works = [work("one", 0), work("two", 2), work("three", 3)];

function setup(t, transport = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  t.after(() => client.clear());
  const calls = [];
  let reads = 0;
  const api = loadTypeScript("../src/queries/workTreeMoves.ts", {
    "../api/works.api": {
      updateWork:
        transport.updateWork ??
        (async (...args) => calls.push(["work", ...args])),
    },
    "../api/work-categories.api": {
      updateWorkCategory:
        transport.updateCategory ??
        (async (...args) => calls.push(["category", ...args])),
    },
    "./works": { worksKeys },
    "./workCategories": { workCategoriesKeys },
  });
  const entries = [
    [worksKeys.list(), works],
    [workCategoriesKeys.list(), categories],
    [worksKeys.detail("one"), works[0]],
    [worksKeys.detail("two"), works[1]],
  ];
  for (const [queryKey, data] of entries) {
    client.setQueryData(queryKey, data, { updatedAt: 1 });
    // Keep these queries active: an accidental invalidation would refetch them.
    const observer = new QueryObserver(client, {
      queryKey,
      queryFn: async () => {
        reads++;
        return data;
      },
    });
    t.after(observer.subscribe(() => {}));
  }
  return {
    client,
    calls,
    api,
    reads: () => reads,
    moveWork: (variables) =>
      new MutationObserver(client, api.workMoveMutationOptions(client)).mutate(
        variables,
      ),
    moveCategory: (variables) =>
      new MutationObserver(
        client,
        api.categoryMoveMutationOptions(client),
      ).mutate(variables),
  };
}

test("confirmed work move updates its list/detail caches without refetching active queries", async (t) => {
  const runtime = setup(t);
  await runtime.moveWork({ workId: "one", category: categories[1] });
  const updated = runtime.client.getQueryData(worksKeys.list());
  assert.equal(
    runtime.client.getQueryState(worksKeys.detail("two")).dataUpdatedAt,
    1,
  );
  assert.equal(updated[0].category.work_category_id, "B");
  assert.equal(updated[0].measurement_unit, works[0].measurement_unit);
  assert.equal(updated[0].work_prices, works[0].work_prices);
  assert.equal(updated[1], works[1]);
  assert.equal(
    runtime.client.getQueryData(worksKeys.detail("one")).category
      .work_category_id,
    "B",
  );
  assert.equal(runtime.client.getQueryData(worksKeys.detail("two")), works[1]);
  assert.equal(
    runtime.client.getQueryState(worksKeys.detail("three")),
    undefined,
  );
  assert.deepEqual(runtime.calls, [["work", "one", { category: "B" }]]);
  assert.equal(runtime.reads(), 0);
});

test("category move preserves its subtree and updates embedded category references with no GET", async (t) => {
  const runtime = setup(t);
  await runtime.moveCategory({ categoryId: "child", parentId: "B" });
  const updatedCategories = runtime.client.getQueryData(
    workCategoriesKeys.list(),
  );
  const updatedWorks = runtime.client.getQueryData(worksKeys.list());
  assert.equal(updatedCategories[2].parent_id, "B");
  assert.equal(updatedCategories[3], categories[3]);
  assert.equal(updatedWorks[0], works[0]);
  assert.equal(
    runtime.client.getQueryState(worksKeys.detail("one")).dataUpdatedAt,
    1,
  );
  assert.equal(updatedWorks[1].category.parent_id, "B");
  assert.equal(
    runtime.client.getQueryData(worksKeys.detail("two")).category.parent_id,
    "B",
  );
  const tree = buildWorksTree(
    updatedCategories,
    updatedWorks.map((item) => ({ ...item, key: item.work_id })),
    {
      search: "",
      deletedFilter: "active",
    },
  );
  const moved = tree.find((item) => item.name === "B").children[0];
  assert.equal(moved.name, "child");
  assert.equal(moved.children[0].name, "grandchild");
  assert.equal(moved.children[0].children[0].name, "three");
  assert.deepEqual(runtime.calls, [["category", "child", { parent_id: "B" }]]);
  assert.equal(runtime.reads(), 0);
});

test("moving a category to root sends explicit null and only changes that relationship", async (t) => {
  const runtime = setup(t);
  await runtime.moveCategory({ categoryId: "child", parentId: null });
  assert.equal(
    runtime.client.getQueryData(workCategoriesKeys.list())[2].parent_id,
    null,
  );
  assert.equal(
    runtime.client.getQueryData(workCategoriesKeys.list())[3].parent_id,
    "child",
  );
  assert.deepEqual(runtime.calls, [["category", "child", { parent_id: null }]]);
  assert.equal(runtime.reads(), 0);
});

test("failed saves preserve the original cache and do not trigger a refetch", async (t) => {
  const reject = async () => {
    throw new Error("Save failed");
  };
  const runtime = setup(t, { updateWork: reject, updateCategory: reject });
  await assert.rejects(
    runtime.moveWork({ workId: "one", category: categories[1] }),
    /Save failed/,
  );
  await assert.rejects(
    runtime.moveCategory({ categoryId: "child", parentId: "B" }),
    /Save failed/,
  );
  assert.equal(runtime.client.getQueryData(worksKeys.list()), works);
  assert.equal(
    runtime.client.getQueryData(workCategoriesKeys.list()),
    categories,
  );
  assert.equal(runtime.reads(), 0);
});

test("cache changes only after the server confirms the move", async (t) => {
  let confirmSave;
  let markStarted;
  const started = new Promise((resolve) => {
    markStarted = resolve;
  });
  const saving = new Promise((resolve) => {
    confirmSave = resolve;
  });
  const runtime = setup(t, {
    updateWork: () => {
      markStarted();
      return saving;
    },
  });
  const mutation = runtime.moveWork({ workId: "one", category: categories[1] });
  await started;
  assert.equal(runtime.client.getQueryData(worksKeys.list()), works);
  confirmSave();
  await mutation;
  assert.equal(
    runtime.client.getQueryData(worksKeys.list())[0].category.work_category_id,
    "B",
  );
  assert.equal(runtime.reads(), 0);
});

test("a stale list response cannot overwrite the successful move", async (t) => {
  const runtime = setup(t);
  let returnStaleList;
  const staleFetch = runtime.client
    .fetchQuery({
      queryKey: worksKeys.list(),
      staleTime: 0,
      queryFn: () =>
        new Promise((resolve) => {
          returnStaleList = resolve;
        }),
    })
    .catch(() => undefined);
  await runtime.moveWork({ workId: "one", category: categories[1] });
  returnStaleList(works);
  await staleFetch;
  assert.equal(
    runtime.client.getQueryData(worksKeys.list())[0].category.work_category_id,
    "B",
  );
  assert.equal(runtime.reads(), 0);
});

for (const kind of ["work", "category"]) {
  test(`${kind} move does not cancel an unrelated detail being opened`, async (t) => {
    const runtime = setup(t);
    let finishLoading;
    const queryKey = worksKeys.detail("unrelated");
    const fetching = runtime.client.fetchQuery({
      queryKey,
      queryFn: () =>
        new Promise((resolve) => {
          finishLoading = resolve;
        }),
    });
    if (kind === "work")
      await runtime.moveWork({ workId: "one", category: categories[1] });
    else await runtime.moveCategory({ categoryId: "child", parentId: "B" });
    assert.equal(
      runtime.client.getQueryState(queryKey).fetchStatus,
      "fetching",
    );
    finishLoading(work("unrelated", 0));
    assert.equal((await fetching).work_id, "unrelated");
  });
}
