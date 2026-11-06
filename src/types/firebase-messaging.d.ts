declare module "firebase/messaging" {
  export interface Messaging {
    [key: string]: unknown;
  }

  export function isSupported(): Promise<boolean>;
  export function getMessaging(app?: unknown): Messaging;
  export function getToken(
    messaging: Messaging,
    options?: {
      vapidKey?: string;
      serviceWorkerRegistration?: ServiceWorkerRegistration;
    },
  ): Promise<string>;
  export function onMessage(
    messaging: Messaging,
    callback: (payload: { data?: Record<string, string> }) => void,
  ): () => void;
}
