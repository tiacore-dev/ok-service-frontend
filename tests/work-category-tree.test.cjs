const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Exercise the real TypeScript utility without adding a test runner dependency.
const filename = path.resolve(__dirname, "../src/utils/workCategoryTree.ts");
const subject = new Module(filename, module);
subject._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText,
  filename,
);
const {
  buildWorkCategoryTree,
  buildWorksTree,
  getDescendantCategoryIds,
  canMoveCategory,
  canMoveWork,
  workCategoryOptions,
  expandableWorkTreeKeys,
} = subject.exports;

const category = (id, name, parent_id = null, deleted = false) => ({
  work_category_id: id,
  name,
  parent_id,
  deleted,
});
const categories = [
  category("z", "Ящики"),
  category("child", "Арматура", "root"),
  category("root", "Бетон"),
  category("grandchild", "Крепления", "child"),
  category("empty", "Пустая"),
];
const work = (id, name, categoryId, deleted = false) => ({
  key: id,
  work_id: id,
  name,
  category: categories.find((item) => item.work_category_id === categoryId),
  deleted,
});
const works = [
  work("2", "Ямочные работы", "root"),
  work("1", "Аварийные работы", "root"),
  work("3", "Монтаж", "grandchild"),
  work("4", "Удалённая работа", "child", true),
];
const filters = {
  search: "",
  deletedFilter: "active",
  sortField: "name",
  sortOrder: "ascend",
};

test("builds and alphabetizes every category level without mutating source data", () => {
  const original = JSON.stringify(categories);
  const tree = buildWorkCategoryTree(categories);
  assert.deepEqual(
    tree.map((node) => node.name),
    ["Бетон", "Пустая", "Ящики"],
  );
  assert.equal(tree[0].children[0].children[0].key, "grandchild");
  assert.equal(tree[1].children, undefined);
  assert.equal(JSON.stringify(categories), original);
});

test("categories precede alphabetized works, even when the work name comes first", () => {
  const tree = buildWorksTree(categories, works, filters);
  assert.deepEqual(
    tree[0].children.map((node) => node.name),
    ["Арматура", "Аварийные работы", "Ямочные работы"],
  );
  assert.deepEqual(expandableWorkTreeKeys(tree), [
    "category-root",
    "category-child",
    "category-grandchild",
  ]);
});

test("category selection includes descendants and preserves the ancestor path", () => {
  const tree = buildWorksTree(categories, works, {
    ...filters,
    categoryId: "child",
  });
  assert.equal(tree.length, 1);
  assert.equal(tree[0].children.length, 1);
  assert.equal(tree[0].children[0].children[0].children[0].name, "Монтаж");
  assert.deepEqual([...getDescendantCategoryIds(categories, "child")].sort(), [
    "child",
    "grandchild",
  ]);
});

test("work search retains its ancestors and removes unrelated branches", () => {
  const tree = buildWorksTree(categories, works, {
    ...filters,
    search: "  МОНТАЖ ",
  });
  assert.equal(tree.length, 1);
  assert.equal(tree[0].children.length, 1);
  assert.equal(tree[0].children[0].children[0].children[0].name, "Монтаж");
  assert.deepEqual(
    buildWorksTree(categories, works, { ...filters, search: "нет совпадений" }),
    [],
  );
});

test("category name search includes its subtree and empty matching categories", () => {
  const tree = buildWorksTree(categories, works, {
    ...filters,
    search: "арматура",
  });
  assert.equal(tree[0].children[0].children[0].children[0].name, "Монтаж");
  assert.deepEqual(
    buildWorksTree(categories, works, { ...filters, search: "пустая" }).map(
      (row) => row.name,
    ),
    ["Пустая"],
  );
});

test("deleted work filters apply at every depth", () => {
  const tree = buildWorksTree(categories, works, {
    ...filters,
    deletedFilter: "deleted",
  });
  assert.equal(
    tree[0].children[0].children.find((row) => row.kind === "work").name,
    "Удалённая работа",
  );
  assert.equal(
    tree[0].children.some((row) => row.kind === "work"),
    false,
  );
});

test("moves reject self, descendants, existing parent, deleted or missing destinations", () => {
  assert.equal(canMoveCategory(categories, "root", "root"), false);
  assert.equal(canMoveCategory(categories, "root", "grandchild"), false);
  assert.equal(canMoveCategory(categories, "child", "root"), false);
  assert.equal(canMoveCategory(categories, "child", "missing"), false);
  assert.equal(
    canMoveCategory(
      [...categories, category("deleted", "Удалена", null, true)],
      "child",
      "deleted",
    ),
    false,
  );
  assert.equal(canMoveCategory(categories, "root", null), false);
  assert.equal(canMoveCategory(categories, "child", null), true);
  assert.equal(canMoveCategory(categories, "child", "z"), true);
});

test("parent selection excludes the edited category and every descendant", () => {
  assert.deepEqual(
    workCategoryOptions(
      categories,
      getDescendantCategoryIds(categories, "root"),
    ).map((item) => item.value),
    ["empty", "z"],
  );
  assert.equal(
    workCategoryOptions([category("deleted", "Удалена", null, true)])[0]
      .disabled,
    true,
  );
});

test("a work can move only to another existing active category, never to root", () => {
  assert.equal(canMoveWork(categories, works[0], null), false);
  assert.equal(canMoveWork(categories, works[0], "root"), false);
  assert.equal(canMoveWork(categories, works[0], "missing"), false);
  assert.equal(
    canMoveWork(
      [...categories, category("deleted", "Удалена", null, true)],
      works[0],
      "deleted",
    ),
    false,
  );
  assert.equal(canMoveWork(categories, works[0], "child"), true);
});

test("orphaned and cyclic category input terminates and retains every category", () => {
  const malformed = [
    category("a", "А", "b"),
    category("b", "Б", "a"),
    category("c", "В", "missing"),
  ];
  assert.equal(buildWorkCategoryTree(malformed).length, 3);
  assert.deepEqual([...getDescendantCategoryIds(malformed, "a")].sort(), [
    "a",
    "b",
  ]);
});

test("keeps works with embedded categories missing from the directory", () => {
  const tree = buildWorksTree([], [works[0]], filters);
  assert.equal(tree[0].name, "Бетон");
  assert.equal(tree[0].children[0].name, "Ямочные работы");
});
