import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const ACHIEVEMENTS = [
  { id: "beginner", threshold: 5 },
  { id: "starter", threshold: 10 },
  { id: "hero", threshold: 25 },
  { id: "protector", threshold: 50 },
  { id: "legend", threshold: 100 },
];

export default function useEcoScore() {
  const { user } = useAuth();
  const [ecoScore, setEcoScore] = useState(0);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!user || !db) {
      setEcoScore(0);
      setAchievements([]);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      setEcoScore(data.ecoScore || 0);
      setAchievements(data.achievements || []);
    });

    return () => unsubscribe();
  }, [user]);

  const checkAchievements = async (newScore) => {
    if (!db || !user) return;

    const unlockedIds = achievements.map((a) => a.id);

    const newAchievements = ACHIEVEMENTS.filter(
      (a) =>
        newScore >= a.threshold &&
        !unlockedIds.includes(a.id)
    );

    if (newAchievements.length > 0) {
      const userRef = doc(db, "users", user.uid);

      for (let achievement of newAchievements) {
        await updateDoc(userRef, {
          achievements: arrayUnion({
            id: achievement.id,
            unlockedAt: new Date(),
          }),
        });
      }
    }
  };

  const addEcoPoint = async () => {
    if (!user || !db) return;

    const userRef = doc(db, "users", user.uid);

    const newScore = ecoScore + 1;

    await updateDoc(userRef, {
      ecoScore: increment(1),
    });

    await checkAchievements(newScore);
  };

  return { ecoScore, achievements, addEcoPoint };
}
