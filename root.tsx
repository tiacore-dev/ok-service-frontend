import * as React from "react";
import { Provider } from "react-redux";
import { App } from "./src/components/App/App";
import { PersistGate } from "redux-persist/integration/react";
import { Persistor } from "redux-persist/es/types";
import { ConfigProvider, notification } from "antd";
import locale from "antd/es/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import updateLocale from "dayjs/plugin/updateLocale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface IRootProps {
  store: any;
  persistor: Persistor;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Настройки по умолчанию
      retry: 1,
    },
  },
});

dayjs.extend(updateLocale);
dayjs.updateLocale("ru", {
  weekStart: 1,
});

export const NotificationContext = React.createContext(null);

export function Root({ store, persistor }: IRootProps) {
  const [api, contextHolder] = notification.useNotification();
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <NotificationContext.Provider value={api}>
            <ConfigProvider
              locale={locale}
              theme={{
                token: {
                  colorPrimary: "#e40808",
                  borderRadius: 5,
                },
              }}
            >
              <Provider store={store}>
                <App />
              </Provider>
              {contextHolder}
            </ConfigProvider>
          </NotificationContext.Provider>
        </PersistGate>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
