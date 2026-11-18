const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loadTypeScript(relativePath, imports = {}) {
  const filename = path.resolve(__dirname, relativePath);
  const loaded = new Module(filename, module);
  loaded.require = (name) =>
    name.endsWith(".less")
      ? {}
      : name in imports
        ? imports[name]
        : require(name);
  loaded._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019,
        jsx: ts.JsxEmit.React,
      },
    }).outputText,
    filename,
  );
  return loaded.exports;
}
const treeUtility = loadTypeScript("../src/utils/workSelectTree.ts", {
  "./workCategoryTree": loadTypeScript("../src/utils/workCategoryTree.ts"),
});
const { buildWorkSelectTree, matchesWorkSelectSearch } = treeUtility;
const { WorkTreeSelect } = loadTypeScript(
  "../src/components/WorkTreeSelect/WorkTreeSelect.tsx",
  {
    "../../utils/workSelectTree": treeUtility,
    antd: {
      TreeSelect: () => null,
      Spin: () => React.createElement("span"),
      Button: ({ children }) => React.createElement("button", null, children),
    },
  },
);
const categories = [
  { work_category_id: "root", name: "Бетон" },
  { work_category_id: "child", name: "Арматура", parent_id: "root" },
  { work_category_id: "empty", name: "Пустая" },
];
const work = (id, name, categoryIndex = 0, deleted = false) => ({
  work_id: id,
  name,
  category: categories[categoryIndex],
  deleted,
});
const works = [
  work("b", "Ямочные работы"),
  work("a", "Аварийные работы"),
  work("nested", "Монтаж арматуры", 1),
];
const tree = buildWorkSelectTree(categories, works);
const state = {
  treeData: tree,
  workIds: new Set(works.map((item) => item.work_id)),
  loading: false,
  error: false,
  retry() {},
};
const selectProps = (data = state, props = {}) =>
  WorkTreeSelect.render({ data, ...props }, null).props;

test("all category levels are expandable but only real work IDs can be selected", () => {
  assert.equal(tree[0].selectable, false);
  assert.equal(tree[0].children[0].selectable, false);
  assert.equal(tree[0].children[0].children[0].selectable, true);
  assert.equal(tree[0].children[0].children[0].value, "nested");
  assert.deepEqual(
    tree[0].children.map((node) => node.title),
    ["Арматура", "Аварийные работы", "Ямочные работы"],
  );
  assert.notEqual(tree[0].value, "root");
});

test("empty branches, deleted works and works without IDs are excluded", () => {
  const options = buildWorkSelectTree(categories, [
    work("deleted", "Удалена", 1, true),
    work(undefined, "Без ID"),
  ]);
  assert.deepEqual(options, []);
  assert.equal(tree.length, 1);
});

test("works remain available through their embedded category if directory data is incomplete", () => {
  const options = buildWorkSelectTree([], [works[0]]);
  assert.equal(options[0].title, "Бетон");
  assert.equal(options[0].children[0].value, "b");
});

test("search matches Russian work/category titles regardless of case or surrounding spaces", () => {
  const nested = tree[0].children[0].children[0];
  assert.equal(matchesWorkSelectSearch("  МОНТАЖ  ", nested), true);
  assert.equal(matchesWorkSelectSearch("бЕтОн", tree[0]), true);
  assert.equal(matchesWorkSelectSearch("нет совпадения", nested), false);
  assert.equal(matchesWorkSelectSearch("nested", nested), false);
});

test("selector refuses category values, emits raw work IDs and supports clearing", () => {
  const values = [];
  const props = selectProps(state, {
    value: "nested",
    onChange: (value) => values.push(value),
  });
  props.onChange(tree[0].value);
  props.onChange("unknown-id");
  assert.deepEqual(values, []);
  props.onChange("nested");
  props.onChange(undefined);
  assert.deepEqual(values, ["nested", undefined]);
  assert.equal(props.value, "nested");
  assert.equal(props.treeNodeLabelProp, "title");
});

test("empty dropdown shows loading while either catalog request is pending", () => {
  const props = selectProps({ ...state, treeData: [], loading: true });
  const markup = renderToStaticMarkup(props.notFoundContent);
  assert.match(markup, /Загрузка работ/);
  assert.match(markup, /role="status"/);
  assert.equal(props["aria-busy"], true);
  assert.equal(
    selectProps({ ...state, treeData: [] }).notFoundContent,
    "Работы не найдены",
  );
});

test("refreshing a cached catalog keeps the tree visible together with loading status", () => {
  const props = selectProps({ ...state, loading: true });
  const markup = renderToStaticMarkup(
    props.dropdownRender(React.createElement("div", null, "Меню дерева")),
  );
  assert.match(markup, /Загрузка работ/);
  assert.match(markup, /Меню дерева/);
});

test("failed dropdown loading offers retry instead of an empty results message", () => {
  let retries = 0;
  const props = selectProps({
    ...state,
    treeData: [],
    error: true,
    retry: () => retries++,
  });
  const markup = renderToStaticMarkup(props.notFoundContent);
  assert.match(markup, /Не удалось загрузить работы/);
  assert.match(markup, /Повторить/);
  props.notFoundContent.props.children[1].props.onClick();
  assert.equal(retries, 1);
});
