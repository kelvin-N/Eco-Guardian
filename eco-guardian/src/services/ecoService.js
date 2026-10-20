import { db } from "../firebase/firebaseConfig";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as limitTo,
  runTransaction,
} from "firebase/firestore";
import {
  auth,
  firebaseConfigurationError,
} from "../firebase/firebaseConfig";

const requireFirestore = () => {
  if (!db) {
    throw new Error(firebaseConfigurationError || "Firebase is not configured.");
  }
};

export const createUserProfile = async (uid, email) => {
  requireFirestore();

  const displayName =
    auth?.currentUser?.displayName || email?.split("@")[0] || "Eco Guardian";
  const profile = {
    email,
    displayName,
    ecoScore: 0,
    role: "user",
    createdAt: serverTimestamp(),
  };
  await runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "users", uid);
    const leaderboardRef = doc(db, "leaderboard", uid);
    const [profileSnapshot, leaderboardSnapshot] = await Promise.all([
      transaction.get(profileRef),
      transaction.get(leaderboardRef),
    ]);
    if (profileSnapshot.exists()) {
      if (!leaderboardSnapshot.exists()) {
        const existingProfile = profileSnapshot.data();
        const existingDisplayName =
          existingProfile.displayName ||
          existingProfile.email?.split("@")[0] ||
          "Eco Guardian";
        if (!existingProfile.displayName) {
          transaction.update(profileRef, { displayName: existingDisplayName });
        }
        transaction.set(leaderboardRef, {
          displayName: existingDisplayName,
          ecoScore: Number(existingProfile.ecoScore) || 0,
          updatedAt: serverTimestamp(),
        });
      }
      return;
    }

    transaction.set(profileRef, profile);
    transaction.set(leaderboardRef, {
      displayName,
      ecoScore: 0,
      updatedAt: serverTimestamp(),
    });
  });
};

// helper for changing a user's role (e.g. promote to admin)
export const setUserRole = async (uid, role) => {
  requireFirestore();
  await updateDoc(doc(db, "users", uid), { role });
};

// fetch all user documents (for admin dashboard)
export const getAllUsers = async () => {
  requireFirestore();
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUserEcoScore = async (uid) => {
  requireFirestore();
  const userSnapshot = await getDoc(doc(db, "users", uid));
  return userSnapshot.exists() ? Number(userSnapshot.data().ecoScore) || 0 : 0;
};

// generic activity with point value (used by several features)
export const addEcoActivity = async (uid, activity, points) => {
  requireFirestore();
  if (!Number.isInteger(points) || points <= 0 || points > 1000) {
    throw new Error("Activity points must be a whole number from 1 to 1,000.");
  }
  await addScoredActivity(uid, "activities", {
    activity,
    points,
  });
};

// Carbon savings are self-reported and are not used to award leaderboard points.
export const addCarbonActivity = async (uid, activity, co2) => {
  requireFirestore();
  const normalizedActivity = typeof activity === "string" ? activity.trim() : "";
  if (
    normalizedActivity.length < 3 ||
    normalizedActivity.length > 160 ||
    !Number.isFinite(co2) ||
    co2 <= 0 ||
    co2 > 1000
  ) {
    throw new Error("Carbon activity values are invalid.");
  }

  await addDoc(collection(db, "carbonActivities"), {
    activity: normalizedActivity,
    co2,
    points: 0,
    uid,
    createdAt: serverTimestamp(),
  });
};

async function addScoredActivity(uid, collectionName, record) {
  const recordRef = doc(collection(db, collectionName));
  const profileRef = doc(db, "users", uid);
  const leaderboardRef = doc(db, "leaderboard", uid);
  const points = record.points;

  await runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (!profileSnapshot.exists()) {
      throw new Error("Your user profile is missing. Please sign in again.");
    }

    const currentScore = Number(profileSnapshot.data().ecoScore) || 0;
    const nextScore = currentScore + points;
    const displayName =
      profileSnapshot.data().displayName ||
      auth?.currentUser?.displayName ||
      auth?.currentUser?.email?.split("@")[0] ||
      "Eco Guardian";

    transaction.set(recordRef, {
      ...record,
      uid,
      createdAt: serverTimestamp(),
    });
    transaction.update(profileRef, {
      ecoScore: nextScore,
      lastAwardedRecordId: recordRef.id,
      ...(profileSnapshot.data().displayName ? {} : { displayName }),
    });
    transaction.set(leaderboardRef, {
      displayName,
      ecoScore: nextScore,
      updatedAt: serverTimestamp(),
    });
  });
}

export const getCarbonActivities = async (uid) => {
  requireFirestore();

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
  requireFirestore();

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
  requireFirestore();
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
    throw new Error("Waste amount must be greater than 0 and no more than 10,000 kg.");
  }
  await addScoredActivity(uid, "wasteReports", {
    type,
    amount,
    location,
    points: 5,
  });
};

export const getWasteReports = async (uid) => {
  requireFirestore();

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
  requireFirestore();

  const q = query(
    collection(db, "leaderboard"),
    orderBy("ecoScore", "desc"),
    limitTo(limit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// update arbitrary user profile data in firestore
export const updateUserProfileData = async (uid, data) => {
  requireFirestore();
  const changedFields = Object.keys(data);
  if (
    changedFields.length === 0
    || changedFields.some((field) => !["displayName", "photoURL"].includes(field))
    || (Object.hasOwn(data, "displayName") && typeof data.displayName !== "string")
    || (
      Object.hasOwn(data, "photoURL")
      && data.photoURL !== null
      && typeof data.photoURL !== "string"
    )
  ) {
    throw new Error("Profile changes are invalid.");
  }
  if (!Object.hasOwn(data, "displayName")) {
    await updateDoc(doc(db, "users", uid), data);
    return;
  }

  const profileRef = doc(db, "users", uid);
  const leaderboardRef = doc(db, "leaderboard", uid);
  await runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (!profileSnapshot.exists()) {
      throw new Error("Your user profile could not be found.");
    }

    transaction.update(profileRef, data);
    transaction.set(leaderboardRef, {
      displayName: data.displayName,
      ecoScore: Number(profileSnapshot.data().ecoScore) || 0,
      updatedAt: serverTimestamp(),
    });
  });
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
  requireFirestore();

  const q = query(
    collection(db, "badges"),
    where("uid", "==", uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// award a badge to user
export const awardBadge = async (uid, badgeId) => {
  requireFirestore();

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
    requireFirestore();
    const user = await getDoc(doc(db, "users", uid));
    if (!user.exists()) return;
    const userData = user.data();
    const activities = await getUserActivities(uid);
    const carbon = await getCarbonActivities(uid);
    const waste = await getWasteReports(uid);

    const co2Total = carbon.reduce((s, a) => s + (a.co2 || 0), 0);

    const activityCount = activities.length + carbon.length + waste.length;

    if (activityCount >= 1) await awardBadge(uid, "first-steps");
    if (activityCount >= 10) await awardBadge(uid, "eco-warrior");
    if (co2Total >= 50) await awardBadge(uid, "carbon-cutter");
    if (waste.length >= 10) await awardBadge(uid, "recycler");
    if (userData.ecoScore >= 100) await awardBadge(uid, "century");
    if (userData.ecoScore >= 500) await awardBadge(uid, "champion");
    if (co2Total >= 250) await awardBadge(uid, "mega-saver");
  } catch (e) {
    console.error("error checking badges", e);
  }
};
