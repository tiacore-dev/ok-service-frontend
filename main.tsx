import { Root } from "./root";
import { store, persistor } from "./src/store/appStore";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import registerServiceWorker from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <BrowserRouter>
    <Root store={store} persistor={persistor} />
  </BrowserRouter>,
);
// @ts-ignore
registerServiceWorker();
