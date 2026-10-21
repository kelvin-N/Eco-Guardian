// src/features/dashboard/ActivityLog.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig.js";
import { useAuth } from "../../context/AuthContext";

export default function ActivityLog() {
  const { user: currentUser } = useAuth();
  const [activityState, setActivityState] = useState({
    userId: null,
    activities: [],
    loading: true,
  });
  const hasCurrentActivities = activityState.userId === currentUser?.uid;
  const activities = hasCurrentActivities ? activityState.activities : [];
  const loading = Boolean(db && currentUser)
    && (!hasCurrentActivities || activityState.loading);

  useEffect(() => {
    if (!db || !currentUser) return;

    const q = query(
      collection(db, "users", currentUser.uid, "activities"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => doc.data());
      setActivityState({
        userId: currentUser.uid,
        activities: logs,
        loading: false,
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="p-6 bg-blue-100 dark:bg-gray-700 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
        📊 Activity Log
      </h2>
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading...</p>
      ) : activities.length === 0 ? (
        <p>No activities yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map((act, idx) => (
            <li key={idx} className="border-b border-gray-300 dark:border-gray-600 py-2">
              <span className="font-medium">{act.title}</span> -{" "}
              <span className="text-gray-600 dark:text-gray-300">{new Date(act.timestamp?.seconds * 1000).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
