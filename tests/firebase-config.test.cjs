const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const configured = {
  REACT_APP_FIREBASE_API_KEY: "test-api-key",
  REACT_APP_FIREBASE_PROJECT_ID: "test-project",
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: "test-sender",
  REACT_APP_FIREBASE_APP_ID: "test-app",
  REACT_APP_FIREBASE_VAPID_KEY: "test-vapid",
};
const source = fs.readFileSync(
  path.resolve(__dirname, "../src/notifications/firebase.ts"),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

function load(env, failInitialization = false) {
  const calls = { initialized: 0, permissions: 0, tokens: 0, subscriptions: 0 };
  const sdk = {
    getApps: () => [],
    initializeApp: () => {
      calls.initialized++;
      return {};
    },
    isSupported: async () => true,
    getMessaging: () => {
      if (failInitialization) throw new Error("SDK unavailable");
      return {};
    },
    onMessage: () => {
      calls.subscriptions++;
      return () => undefined;
    },
    getToken: async () => {
      calls.tokens++;
      return "test-token";
    },
  };
  const context = {
    exports: {},
    require: () => sdk,
    process: { env },
    Notification: {
      requestPermission: async () => {
        calls.permissions++;
        return "granted";
      },
    },
    navigator: { serviceWorker: { ready: Promise.resolve({}) } },
  };
  vm.runInNewContext(compiled, context);
  return { api: context.exports, calls };
}

test("missing or blank required Firebase settings skip SDK initialization", async () => {
  for (const key of Object.keys(configured).filter(
    (key) => !key.endsWith("VAPID_KEY"),
  )) {
    for (const value of [undefined, "", "   "]) {
      const { api, calls } = load({ ...configured, [key]: value });
      assert.equal(await api.getFirebaseMessaging(), null, key);
      assert.equal(calls.initialized, 0, key);
    }
  }
});

test("foreground subscription without Firebase configuration is a safe no-op", async () => {
  const { api, calls } = load({});
  const cleanup = await api.subscribeToForegroundMessages(() =>
    assert.fail("Unexpected message"),
  );
  assert.equal(typeof cleanup, "function");
  cleanup();
  assert.equal(calls.subscriptions, 0);
});

test("SDK initialization failures do not reject the optional foreground subscription", async () => {
  const { api } = load(configured, true);
  const cleanup = await api.subscribeToForegroundMessages(() => {});
  assert.equal(typeof cleanup, "function");
});

test("push setup without configuration or VAPID never requests browser permission", async () => {
  for (const env of [{}, { ...configured, REACT_APP_FIREBASE_VAPID_KEY: "" }]) {
    const { api, calls } = load(env);
    await assert.rejects(
      api.requestWebPushToken(),
      /Push-уведомления не настроены/,
    );
    assert.equal(calls.permissions, 0);
    assert.equal(calls.tokens, 0);
  }
});

test("configured push still subscribes and requests a token", async () => {
  const { api, calls } = load(configured);
  await api.subscribeToForegroundMessages(() => {});
  assert.equal(calls.subscriptions, 1);
  assert.equal(await api.requestWebPushToken(), "test-token");
  assert.equal(calls.permissions, 1);
  assert.equal(calls.tokens, 1);
});

test("service worker without Firebase settings continues registering offline routes", () => {
  const swSource = fs.readFileSync(
    path.resolve(__dirname, "../src/src-sw.js"),
    "utf8",
  );
  const code = ts.transpileModule(swSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
  let routes = 0;
  let precached = false;
  const workbox = {
    clientsClaim() {},
    precacheAndRoute() {
      precached = true;
    },
    registerRoute() {
      routes++;
    },
    ExpirationPlugin: class {},
    CacheFirst: class {},
    StaleWhileRevalidate: class {},
    CacheableResponsePlugin: class {},
  };
  vm.runInNewContext(code, {
    exports: {},
    require: () => workbox,
    process: { env: {} },
    importScripts: () => assert.fail("Firebase scripts should not load"),
    self: { addEventListener() {}, skipWaiting() {}, __WB_MANIFEST: [] },
  });
  assert.equal(precached, true);
  assert.equal(routes, 2);
});
