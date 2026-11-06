import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getToken,
  getMessaging,
  isSupported,
  Messaging,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!(await isSupported())) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
};

export const getFirebaseVapidKey = (): string =>
  process.env.REACT_APP_FIREBASE_VAPID_KEY || "";

export const subscribeToForegroundMessages = async (
  callback: (payload: { data?: Record<string, string> }) => void,
): Promise<() => void> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => undefined;
  return onMessage(messaging, callback);
};

export const requestWebPushToken = async () => {
  if (!(await isSupported()) || typeof Notification === "undefined") {
    throw new Error("Браузер не поддерживает Web Push");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Разрешение на уведомления не предоставлено");
  }
  const messaging = await getFirebaseMessaging();
  if (!messaging) throw new Error("Firebase Messaging недоступен");
  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Не удалось получить push-токен");
  return token;
};
