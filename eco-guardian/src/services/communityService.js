import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  db,
  firebaseConfigurationError,
  functions,
} from "../firebase/firebaseConfig";
import {
  deleteIncidentEvidence,
  deleteMarketplaceProductImages,
  uploadMarketplaceProductImages,
  uploadIncidentEvidence,
} from "../firebase/storage";
import { validateIncidentEvidence } from "./incidentEvidence";

function requireFirestore() {
  if (!db) {
    throw new Error(
      firebaseConfigurationError || "Firebase is required for community features."
    );
  }
}

export async function getCommunityEvents() {
  requireFirestore();
  const eventsQuery = query(
    collection(db, "events"),
    where("startsAt", ">=", Timestamp.now()),
    orderBy("startsAt", "asc")
  );
  const snapshot = await getDocs(eventsQuery);
  return snapshot.docs.map((eventDoc) => ({
    id: eventDoc.id,
    ...eventDoc.data(),
  }));
}

export async function createCommunityEvent(uid, event) {
  requireFirestore();
  const eventRef = await addDoc(collection(db, "events"), {
    ...event,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  return eventRef.id;
}

export async function getUserEventRsvps(uid) {
  requireFirestore();
  const snapshot = await getDocs(
    collection(db, "users", uid, "eventRsvps")
  );
  return new Set(snapshot.docs.map((rsvpDoc) => rsvpDoc.id));
}

export async function setEventRsvp(uid, eventId, attending) {
  requireFirestore();
  const rsvpRef = doc(db, "users", uid, "eventRsvps", eventId);
  if (!attending) {
    await deleteDoc(rsvpRef);
    return;
  }

  const eventRef = doc(db, "events", eventId);
  await runTransaction(db, async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    if (!eventSnapshot.exists()) {
      throw new Error("This event is no longer available.");
    }
    transaction.set(rsvpRef, {
      eventId,
      userId: uid,
      createdAt: serverTimestamp(),
    });
  });
}

export async function getProductListings() {
  requireFirestore();
  const productsQuery = query(
    collection(db, "products"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }));
}

export async function createProductListing(uid, product, imageFiles = []) {
  requireFirestore();
  const productRef = doc(collection(db, "products"));
  await setDoc(productRef, {
    ...product,
    currency: "GHS",
    reservedStock: 0,
    images: [],
    sellerId: uid,
    createdAt: serverTimestamp(),
  });

  let uploadedImages = [];
  try {
    if (imageFiles.length > 0) {
      uploadedImages = await uploadMarketplaceProductImages(uid, productRef.id, imageFiles);
      await updateDoc(productRef, { images: uploadedImages });
    }
  } catch (error) {
    let cleanupMessage = "";
    if (uploadedImages.length > 0) {
      try {
        await deleteMarketplaceProductImages(uploadedImages);
      } catch (cleanupError) {
        console.error("Failed to clean up product images:", cleanupError);
        cleanupMessage = " Some uploaded images could not be removed.";
      }
    }
    try {
      await deleteDoc(productRef);
    } catch (cleanupError) {
      console.error("Failed to remove incomplete product listing:", cleanupError);
      cleanupMessage += " The incomplete listing could not be removed.";
    }
    throw new Error(`${error.message || "Product images could not be uploaded."}${cleanupMessage}`);
  }

  return productRef.id;
}

export async function updateProductListing(productId, changes) {
  requireFirestore();
  await updateDoc(doc(db, "products", productId), {
    ...changes,
    currency: "GHS",
  });
}

export async function getCommunityChallengeMembers(challengeId, periodStart) {
  requireFirestore();
  const membersQuery = query(
    collection(db, "challengeMembers"),
    where("challengeId", "==", challengeId),
    where("periodStart", "==", periodStart)
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map((memberDoc) => ({
    id: memberDoc.id,
    ...memberDoc.data(),
  }));
}

export async function joinCommunityChallenge(uid, displayName, challengeId, periodStart) {
  requireFirestore();
  const memberId = `${challengeId}_${periodStart}_${uid}`;
  await setDoc(doc(db, "challengeMembers", memberId), {
    challengeId,
    periodStart,
    uid,
    displayName: displayName.slice(0, 80),
    joinedAt: serverTimestamp(),
  });
}

export async function leaveCommunityChallenge(uid, challengeId, periodStart) {
  requireFirestore();
  const memberId = `${challengeId}_${periodStart}_${uid}`;
  await deleteDoc(doc(db, "challengeMembers", memberId));
}

export async function getUserCart(uid) {
  requireFirestore();
  const snapshot = await getDocs(collection(db, "users", uid, "cart"));
  return snapshot.docs.map((cartDoc) => ({
    productId: cartDoc.id,
    ...cartDoc.data(),
  }));
}

export async function addProductToCart(uid, productId) {
  requireFirestore();
  const productRef = doc(db, "products", productId);
  const cartRef = doc(db, "users", uid, "cart", productId);

  await runTransaction(db, async (transaction) => {
    const [productSnapshot, cartSnapshot] = await Promise.all([
      transaction.get(productRef),
      transaction.get(cartRef),
    ]);

    if (!productSnapshot.exists()) {
      throw new Error("This product is no longer available.");
    }

    const stock = productSnapshot.data().stock;
    const quantity = (cartSnapshot.exists() ? cartSnapshot.data().quantity : 0) + 1;
    if (quantity > stock) {
      throw new Error("The cart quantity cannot exceed the available stock.");
    }

    transaction.set(cartRef, {
      productId,
      quantity,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function removeProductFromCart(uid, productId) {
  requireFirestore();
  await deleteDoc(doc(db, "users", uid, "cart", productId));
}

export async function createMarketplaceCheckout() {
  if (!functions) {
    throw new Error(
      firebaseConfigurationError || "Firebase Functions are required for checkout."
    );
  }
  const createCheckout = httpsCallable(functions, "createMarketplaceCheckout");
  const result = await createCheckout();
  const checkoutUrl = result.data?.checkoutUrl;
  if (typeof checkoutUrl !== "string") {
    throw new Error("Checkout service returned an invalid payment URL.");
  }
  const parsedCheckoutUrl = new URL(checkoutUrl);
  if (
    parsedCheckoutUrl.protocol !== "https:"
    || parsedCheckoutUrl.hostname !== "checkout.paystack.com"
  ) {
    throw new Error("Checkout service returned an untrusted payment URL.");
  }
  return parsedCheckoutUrl.toString();
}

export async function getUserMarketplaceOrders(uid) {
  requireFirestore();
  const ordersQuery = query(
    collection(db, "marketplaceOrders"),
    where("buyerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((orderDoc) => ({
    id: orderDoc.id,
    ...orderDoc.data(),
  }));
}

export async function createIncidentReport(uid, report, evidenceFiles = []) {
  requireFirestore();
  const evidenceError = validateIncidentEvidence(evidenceFiles);
  if (evidenceError) throw new Error(evidenceError);

  const reportRef = await addDoc(collection(db, "incidentReports"), {
    ...report,
    uid,
    status: "open",
    createdAt: serverTimestamp(),
  });

  const uploadedEvidence = [];
  let imageCount = 0;
  try {
    for (const file of evidenceFiles) {
      const kind = file.type.startsWith("image/") ? "image" : "video";
      const evidenceId = kind === "image"
        ? `image-${++imageCount}`
        : "video-1";
      const evidenceRef = doc(
        collection(db, "incidentReports", reportRef.id, "evidence"),
        evidenceId
      );
      const metadata = await uploadIncidentEvidence(uid, reportRef.id, evidenceRef.id, file);
      uploadedEvidence.push({ evidenceRef, metadata });
      await setDoc(evidenceRef, {
        ...metadata,
        createdAt: serverTimestamp(),
      });
    }
    return { id: reportRef.id, evidenceCount: uploadedEvidence.length };
  } catch (uploadError) {
    const cleanupResults = await Promise.allSettled(
      uploadedEvidence.map(async ({ evidenceRef, metadata }) => {
        await deleteIncidentEvidence(metadata.storagePath);
        await deleteDoc(evidenceRef);
      })
    );
    cleanupResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Failed to clean up incident evidence after upload failure:", result.reason);
      }
    });

    const error = new Error(
      `Report ${reportRef.id} was submitted, but its evidence could not be fully uploaded. ${uploadError.message}`
    );
    error.reportSubmitted = true;
    error.reportId = reportRef.id;
    throw error;
  }
}

export async function getIncidentReportEvidence(reportId) {
  requireFirestore();
  const evidenceSnapshot = await getDocs(
    collection(db, "incidentReports", reportId, "evidence")
  );
  return evidenceSnapshot.docs.map((evidenceDoc) => ({
    id: evidenceDoc.id,
    ...evidenceDoc.data(),
  }));
}

export async function deleteIncidentReportEvidence(reportId, evidenceId, storagePath) {
  requireFirestore();
  await deleteIncidentEvidence(storagePath);
  await deleteDoc(doc(db, "incidentReports", reportId, "evidence", evidenceId));
}

export async function getUserIncidentReports(uid) {
  requireFirestore();
  const reportsQuery = query(
    collection(db, "incidentReports"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(reportsQuery);
  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...reportDoc.data(),
  }));
}

export async function getAllIncidentReports() {
  requireFirestore();
  const reportsQuery = query(
    collection(db, "incidentReports"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(reportsQuery);
  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...reportDoc.data(),
  }));
}

export async function updateIncidentReportStatus(reportId, status) {
  requireFirestore();
  const validStatuses = ["open", "in_review", "resolved", "rejected"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid incident report status.");
  }
  await updateDoc(doc(db, "incidentReports", reportId), {
    status,
    reviewedAt: serverTimestamp(),
  });
}
