// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ==================================================
// DEMO MODE
// Set to false when you have real Firebase credentials
// ==================================================
export const DEMO_MODE = true;

// Firebase configuration from .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Detect placeholder values
const isPlaceholder = (val) =>
  !val ||
  /abc123|1234567|PASTE|XXXXXXXXXXXXXXXXXXXX/.test(String(val));

// Required Firebase fields
const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
];

const missingFields = requiredFields.filter(
  (field) => isPlaceholder(firebaseConfig[field])
);

if (!DEMO_MODE && missingFields.length > 0) {
  console.error(`
❌ Firebase Configuration Error

Missing or invalid credentials:
${missingFields.join(", ")}

Please update your .env.local file with real Firebase values.
`);
}

// Initialize Firebase only when:
// 1. Demo mode is OFF
// 2. Credentials are valid
let app = null;

if (!DEMO_MODE && missingFields.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
  } catch (firebaseError) {
    console.error("❌ Failed to initialize Firebase:", firebaseError);
  }
} else if (DEMO_MODE) {
  console.log("🧪 Running in DEMO MODE (Firebase disabled)");
}

// Exports
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Helper flag
export const isFirebaseConfigured = !!app;