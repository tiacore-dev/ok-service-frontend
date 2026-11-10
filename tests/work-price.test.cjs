const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../src/utils/workPrice.ts");
const loaded = new Module(filename, module);
loaded._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText,
  filename,
);
const { isValidWorkPrice, formatWorkPrice } = loaded.exports;

test("work prices accept zero, positive amounts and exactly -1", () => {
  for (const price of [0, -1, 0.01, 10, 123.45])
    assert.equal(isValidWorkPrice(price), true, String(price));
  for (const price of [
    -2,
    -1.01,
    -0.5,
    NaN,
    Infinity,
    -Infinity,
    null,
    undefined,
    "",
    "0",
    "-1",
  ])
    assert.equal(isValidWorkPrice(price), false, String(price));
});

test("zero and -1 remain visible and only absent prices display a dash", () => {
  assert.equal(formatWorkPrice(0), "0 руб.");
  assert.equal(formatWorkPrice(-1), "-1 руб.");
  assert.equal(formatWorkPrice(12.5), "12.5 руб.");
  assert.equal(formatWorkPrice(null), "-");
  assert.equal(formatWorkPrice(undefined), "-");
});
