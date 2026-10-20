import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfigurationError } from "../firebase/firebaseConfig";

const ORGANIZATION_TYPES = ["School", "NGO", "Business", "Community group", "Other"];
const PILOT_INTERESTS = [
  "Sustainability learning",
  "Group eco-challenges",
  "Community events",
  "Environmental impact reporting",
  "Other",
];

function requireFirestore() {
  if (!db) {
    throw new Error(firebaseConfigurationError || "Firebase is required to submit an inquiry.");
  }
}

export async function createOrganizationInquiry(uid, email, inquiry) {
  requireFirestore();
  const organizationName = inquiry.organizationName.trim();
  const contactName = inquiry.contactName.trim();
  const message = inquiry.message.trim();
  const interests = [...new Set(inquiry.interests)];

  if (organizationName.length < 2 || organizationName.length > 120) {
    throw new Error("Organization name must be between 2 and 120 characters.");
  }
  if (contactName.length < 2 || contactName.length > 80) {
    throw new Error("Contact name must be between 2 and 80 characters.");
  }
  if (!ORGANIZATION_TYPES.includes(inquiry.organizationType)) {
    throw new Error("Select a valid organization type.");
  }
  if (
    interests.length === 0
    || interests.some((interest) => !PILOT_INTERESTS.includes(interest))
  ) {
    throw new Error("Choose at least one area you would like to discuss.");
  }
  if (message.length < 10 || message.length > 1500) {
    throw new Error("Message must be between 10 and 1,500 characters.");
  }

  const inquiryRef = await addDoc(collection(db, "organizationInquiries"), {
    uid,
    email,
    organizationName,
    contactName,
    organizationType: inquiry.organizationType,
    interests,
    message,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return inquiryRef.id;
}

export async function getOrganizationInquiries() {
  requireFirestore();
  const inquiriesQuery = query(
    collection(db, "organizationInquiries"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snapshot = await getDocs(inquiriesQuery);
  return snapshot.docs.map((inquiryDoc) => ({
    id: inquiryDoc.id,
    ...inquiryDoc.data(),
  }));
}
