// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingFields = requiredFields.filter((field) => {
  const value = firebaseConfig[field];
  return !value || /abc123|abcdef|xxxx|1234567890|PASTE|X{8,}|your-project/i.test(value);
});

let app = null;
let firebaseConfigurationError = "";

if (missingFields.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (firebaseError) {
    console.error("Failed to initialize Firebase:", firebaseError);
    firebaseConfigurationError = "Firebase could not initialize. Check the project configuration and restart the app.";
  }
} else {
  const missingVariables = missingFields.map((field) =>
    `VITE_FIREBASE_${field.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`
  );
  firebaseConfigurationError = `Firebase setup is incomplete. Replace missing or placeholder values in .env.local with your real Firebase project settings: ${missingVariables.join(", ")}`;
  console.error(firebaseConfigurationError);
}

export const isFirebaseConfigured = Boolean(app);
export { firebaseConfigurationError };
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
