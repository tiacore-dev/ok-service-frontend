const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

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
const api = load("../src/utils/shiftWorkAvailability.ts", {
  "./getApiErrorMessage": load("../src/utils/getApiErrorMessage.ts"),
});
const {
  getShiftWorkAvailability,
  getShiftDetailWorkError,
  getUnavailableShiftWorkIds,
  getShiftDetailSaveError,
} = api;
const work = (prices, id = "work") => ({ work_id: id, work_prices: prices });
const price = (category, value, deleted = false) => ({
  category,
  price: value,
  deleted,
});
const conflict = (data) => ({
  isAxiosError: true,
  message: "Request failed with status code 409",
  response: { status: 409, data },
});

test("only negative active prices for the shift performer's exact category block a work", () => {
  assert.equal(
    getShiftWorkAvailability(work([price(2, -1), price(3, 100)]), 2).available,
    false,
  );
  assert.equal(
    getShiftWorkAvailability(work([price(2, -1), price(3, 100)]), 3).available,
    true,
  );
  assert.equal(
    getShiftWorkAvailability(work([price(2, -0.5)]), 2).available,
    false,
  );
  assert.equal(
    getShiftWorkAvailability(work([price(0, -1)]), 0).available,
    false,
  );
});

test("zero, positive, missing or deleted prices do not introduce a prohibition", () => {
  for (const prices of [
    [price(2, 0)],
    [price(2, 10)],
    [],
    undefined,
    [price(1, -1)],
    [price(2, -1, true)],
    [price(2, -1, true), price(2, 0)],
  ]) {
    assert.equal(getShiftWorkAvailability(work(prices), 2).available, true);
  }
});

test("a negative price cannot be bypassed by another duplicate positive price", () => {
  assert.equal(
    getShiftWorkAvailability(work([price(2, 100), price(2, -1)]), 2).available,
    false,
  );
});

test("missing employee category or work data is not treated as permission", () => {
  assert.equal(getShiftWorkAvailability(work([]), undefined).available, false);
  assert.equal(getShiftWorkAvailability(undefined, 2).available, false);
  assert.equal(getShiftWorkAvailability(work([]), NaN).available, false);
});

test("unchanged history remains saveable but changing its quantity or work is blocked", () => {
  const forbidden = work([price(2, -1)]);
  const initial = { work: "work", quantity: 5 };
  assert.equal(getShiftDetailWorkError(forbidden, 2, 5, initial), undefined);
  assert.ok(getShiftDetailWorkError(forbidden, 2, 6, initial));
  assert.ok(
    getShiftDetailWorkError(forbidden, 2, 5, { work: "other", quantity: 5 }),
  );
  assert.ok(getShiftDetailWorkError(forbidden, 2, 5));
  assert.ok(getShiftDetailWorkError(forbidden, undefined, 5, initial));
});

test("server rejection can block stale locally allowed data without another read", () => {
  const blocked = new Set(["work"]);
  assert.equal(
    getShiftWorkAvailability(work([price(2, 0)]), 2, blocked).available,
    false,
  );
  assert.equal(
    getShiftWorkAvailability(work([price(2, 0)], "other"), 2, blocked)
      .available,
    true,
  );
  assert.equal(
    getShiftDetailWorkError(
      work([price(2, 0)]),
      2,
      5,
      { work: "work", quantity: 5 },
      blocked,
    ),
    undefined,
  );
});

test("structured 409 exposes the affected works and the server's readable reason", () => {
  const error = conflict({
    code: "WORK_UNAVAILABLE_FOR_PERFORMER_CATEGORY",
    work_ids: ["work", 1],
    msg: "Работа недоступна для категории исполнителя",
  });
  assert.deepEqual(getUnavailableShiftWorkIds(error), ["work"]);
  assert.equal(
    getShiftDetailSaveError(error),
    "Работа недоступна для категории исполнителя",
  );
  assert.match(
    getShiftDetailSaveError(
      conflict({ code: "WORK_UNAVAILABLE_FOR_PERFORMER_CATEGORY" }),
    ),
    /Недоступно/,
  );
  assert.equal(
    getUnavailableShiftWorkIds(conflict({ code: "ANOTHER_CONFLICT" })),
    null,
  );
  assert.equal(getUnavailableShiftWorkIds(new Error("Network error")), null);
  assert.equal(
    getShiftDetailSaveError(new Error("Network error")),
    "Network error",
  );
});
