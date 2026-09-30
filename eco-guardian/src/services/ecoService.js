import { db } from "../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit as limitTo,
} from "firebase/firestore";

const isFirestoreReady = () => !!db;

export const createUserProfile = async (uid, email) => {
  if (!isFirestoreReady()) return null;

  await setDoc(doc(db, "users", uid), {
    email,
    ecoScore: 0,
    role: "user",
    createdAt: serverTimestamp(),
  });
};

// helper for changing a user's role (e.g. promote to admin)
export const setUserRole = async (uid, role) => {
  if (!isFirestoreReady()) return null;
  await updateDoc(doc(db, "users", uid), { role });
};

// fetch all user documents (for admin dashboard)
export const getAllUsers = async () => {
  if (!isFirestoreReady()) return [];
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// generic activity with point value (used by several features)
export const addEcoActivity = async (uid, activity, points) => {
  if (!isFirestoreReady()) return null;

  await addDoc(collection(db, "activities"), {
    uid,
    activity,
    points,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", uid), {
    ecoScore: increment(points),
  });
};

// carbon-specific helpers (store CO2 values for tracking)
export const addCarbonActivity = async (uid, activity, co2, points = 0) => {
  if (!isFirestoreReady()) return null;

  await addDoc(collection(db, "carbonActivities"), {
    uid,
    activity,
    co2,
    points,
    createdAt: serverTimestamp(),
  });
  if (points > 0) {
    await updateDoc(doc(db, "users", uid), {
      ecoScore: increment(points),
    });
  }
};

export const getCarbonActivities = async (uid) => {
  if (!isFirestoreReady()) return [];

  const q = query(
    collection(db, "carbonActivities"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// fetch all activities for a user (ordered newest first)
export const getUserActivities = async (uid) => {
  if (!isFirestoreReady()) return [];

  const q = query(
    collection(db, "activities"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// waste reporting helpers
export const addWasteReport = async (uid, type, amount, location) => {
  if (!isFirestoreReady()) return null;

  await addDoc(collection(db, "wasteReports"), {
    uid,
    type,
    amount,
    location,
    createdAt: serverTimestamp(),
  });
  // award points for waste report
  await updateDoc(doc(db, "users", uid), {
    ecoScore: increment(5),
  });
};

export const getWasteReports = async (uid) => {
  if (!isFirestoreReady()) return [];

  const q = query(
    collection(db, "wasteReports"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// leaderboard (top users by ecoScore)
export const getLeaderboard = async (limit = 10) => {
  if (!isFirestoreReady()) return [];

  const q = query(
    collection(db, "users"),
    orderBy("ecoScore", "desc"),
    limitTo(limit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// update arbitrary user profile data in firestore
export const updateUserProfileData = async (uid, data) => {
  if (!isFirestoreReady()) return null;
  await updateDoc(doc(db, "users", uid), data);
};

// Badge/Achievement system
// Define all available badges
export const BADGE_DEFINITIONS = {
  "first-steps": {
    id: "first-steps",
    name: "First Steps",
    description: "Log your first eco activity",
    icon: "🌱",
    requirement: { type: "activities", count: 1 },
  },
  "eco-warrior": {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Complete 10 eco activities",
    icon: "⚔️",
    requirement: { type: "activities", count: 10 },
  },
  "carbon-cutter": {
    id: "carbon-cutter",
    name: "Carbon Cutter",
    description: "Save 50 kg CO₂",
    icon: "✂️",
    requirement: { type: "co2Saved", value: 50 },
  },
  "recycler": {
    id: "recycler",
    name: "Recycler",
    description: "Report 10 waste items",
    icon: "♻️",
    requirement: { type: "wasteCount", count: 10 },
  },
  "champion": {
    id: "champion",
    name: "Eco Champion",
    description: "Reach 500 eco score",
    icon: "👑",
    requirement: { type: "ecoScore", value: 500 },
  },
  "century": {
    id: "century",
    name: "Century Club",
    description: "Reach 100 eco score",
    icon: "💯",
    requirement: { type: "ecoScore", value: 100 },
  },
  "mega-saver": {
    id: "mega-saver",
    name: "Mega Saver",
    description: "Save 250 kg CO₂",
    icon: "🌍",
    requirement: { type: "co2Saved", value: 250 },
  },
};

// get user badges
export const getUserBadges = async (uid) => {
  if (!isFirestoreReady()) return [];

  const q = query(
    collection(db, "badges"),
    where("uid", "==", uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// award a badge to user
export const awardBadge = async (uid, badgeId) => {
  if (!isFirestoreReady()) return;

  const badge = BADGE_DEFINITIONS[badgeId];
  if (!badge) return;

  try {
    // check if already awarded
    const existing = query(
      collection(db, "badges"),
      where("uid", "==", uid),
      where("badgeId", "==", badgeId)
    );
    const snap = await getDocs(existing);
    if (snap.size > 0) return; // already awarded

    // add badge
    await addDoc(collection(db, "badges"), {
      uid,
      badgeId,
      name: badge.name,
      icon: badge.icon,
      unlockedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("failed to award badge", e);
  }
};

// check and auto-award badges based on user stats
export const checkAndAwardBadges = async (uid) => {
  try {
    const user = await getDocs(query(
      collection(db, "users"),
      where("uid", "==", uid)
    ));
    if (user.empty) return;

    const userData = user.docs[0].data();
    const activities = await getUserActivities(uid);
    const carbon = await getCarbonActivities(uid);
    const waste = await getWasteReports(uid);

    const co2Total = carbon.reduce((s, a) => s + (a.co2 || 0), 0);

    // check each badge
    if (activities.length >= 1) await awardBadge(uid, "first-steps");
    if (activities.length >= 10) await awardBadge(uid, "eco-warrior");
    if (co2Total >= 50) await awardBadge(uid, "carbon-cutter");
    if (waste.length >= 10) await awardBadge(uid, "recycler");
    if (userData.ecoScore >= 100) await awardBadge(uid, "century");
    if (userData.ecoScore >= 500) await awardBadge(uid, "champion");
    if (co2Total >= 250) await awardBadge(uid, "mega-saver");
  } catch (e) {
    console.error("error checking badges", e);
  }
};
