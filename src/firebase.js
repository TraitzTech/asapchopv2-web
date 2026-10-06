import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getAuth } from "firebase/auth";

// Asapchop's Firebase web app (project asapchop-5dedf). These values are public by design: they
// are sent to every browser, and the same ones are served in the admin's firebase-messaging-sw.js.
// NEXT_PUBLIC_FIREBASE_* env vars override them at build time.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBrtLMK7CQUSyeqxDsstjMVqfoF32mHeiQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "asapchop-5dedf.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "asapchop-5dedf",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "asapchop-5dedf.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "800335530798",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:800335530798:web:d21c1af53adf15944488bf",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Y2CERPY1KV",
};

// Web push key from Firebase console > Project settings > Cloud Messaging > Web Push certificates.
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(firebaseApp);

// Correctly export a promise that resolves to messaging instance (or null)
export const getMessagingObject = async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(firebaseApp);
    }
    return null;
  } catch (err) {
    console.error("Messaging not supported:", err);
    return null;
  }
};

// fetchToken function
export const fetchToken = async (setTokenFound, setFcmToken) => {
  try {
    // Without a web push key there is no token to fetch: skip instead of erroring on every page.
    if (!vapidKey) return;
    const messaging = await getMessagingObject();
    if (!messaging) return;

    const currentToken = await getToken(messaging, { vapidKey });

    if (currentToken) {
      setTokenFound(true);
      setFcmToken(currentToken);
    } else {
      setTokenFound(false);
      setFcmToken();
    }
  } catch (err) {
    console.error("Token fetch error:", err);
  }
};

// onMessageListener function
export const onMessageListener = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const messaging = await getMessagingObject();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } catch (err) {
      reject(err);
    }
  });
