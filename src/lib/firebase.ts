// Import the functions you need from the SDKs you need
import { FirebaseError, initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createAuth() {
  if (typeof window === "undefined") {
    try {
      return initializeAuth(app, { persistence: inMemoryPersistence });
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/already-initialized") {
        return getAuth(app);
      }
      throw err;
    }
  }
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch (err) {
    if (err instanceof FirebaseError && err.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw err;
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
