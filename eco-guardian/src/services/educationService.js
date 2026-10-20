import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfigurationError } from "../firebase/firebaseConfig";

function requireFirestore() {
  if (!db) {
    throw new Error(firebaseConfigurationError || "Firebase is required to save learning progress.");
  }
}

export async function getEducationProgress(uid) {
  requireFirestore();
  const snapshot = await getDocs(collection(db, "users", uid, "learningProgress"));
  return Object.fromEntries(snapshot.docs.map((progressDoc) => [
    progressDoc.id,
    progressDoc.data(),
  ]));
}

export async function saveEducationAttempt(uid, lessonId, score, passed) {
  requireFirestore();
  if (!Number.isInteger(score) || score < 0 || score > 100 || typeof passed !== "boolean") {
    throw new Error("Learning quiz result is invalid.");
  }

  const progressRef = doc(db, "users", uid, "learningProgress", lessonId);
  let savedProgress;
  await runTransaction(db, async (transaction) => {
    const progressSnapshot = await transaction.get(progressRef);
    const previousProgress = progressSnapshot.exists() ? progressSnapshot.data() : {};
    savedProgress = {
      lessonId,
      attempts: (previousProgress.attempts || 0) + 1,
      bestScore: Math.max(previousProgress.bestScore || 0, score),
      completed: Boolean(previousProgress.completed) || passed,
      updatedAt: serverTimestamp(),
    };
    transaction.set(progressRef, savedProgress);
  });
  return {
    ...savedProgress,
    updatedAt: new Date(),
  };
}
