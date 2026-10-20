import { storage } from "./firebaseConfig";
import {
  deleteObject,
  getBytes,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { INCIDENT_EVIDENCE_TYPES } from "../services/incidentEvidence";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRODUCT_IMAGE_MAX_COUNT = 5;
const PRODUCT_IMAGE_MAX_FILE_SIZE = 10 * 1024 * 1024;
const PRODUCT_IMAGE_MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_MAX_OPTIMIZED_SIZE = 2 * 1024 * 1024;

export function validateMarketplaceProductImages(files) {
  if (files.length > PRODUCT_IMAGE_MAX_COUNT) {
    throw new Error(`Choose no more than ${PRODUCT_IMAGE_MAX_COUNT} product images.`);
  }
  if (files.some((file) => !AVATAR_CONTENT_TYPES.includes(file.type))) {
    throw new Error("Product images must be JPEG, PNG, or WebP files.");
  }
  if (files.some((file) => file.size === 0 || file.size > PRODUCT_IMAGE_MAX_FILE_SIZE)) {
    throw new Error("Each product image must be larger than 0 bytes and no more than 10 MB.");
  }
  if (files.reduce((total, file) => total + file.size, 0) > PRODUCT_IMAGE_MAX_TOTAL_SIZE) {
    throw new Error("Selected product images must total no more than 25 MB.");
  }
}

async function optimizeMarketplaceProductImage(file) {
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot resize product images. Try a newer browser.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      PRODUCT_IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Product image could not be resized.");

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.68, 0.52]) {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => result
            ? resolve(result)
            : reject(new Error("Product image could not be optimized.")),
          "image/jpeg",
          quality
        );
      });
      if (blob.size <= PRODUCT_IMAGE_MAX_OPTIMIZED_SIZE) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }

    throw new Error("An optimized product image must be no more than 2 MB.");
  } finally {
    bitmap.close();
  }
}

export async function uploadMarketplaceProductImages(uid, productId, files) {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  validateMarketplaceProductImages(files);

  const uploadedPaths = [];
  const images = [];
  try {
    for (const [index, file] of files.entries()) {
      const optimizedFile = await optimizeMarketplaceProductImage(file);
      const storagePath = `products/${uid}/${productId}/image-${index + 1}`;
      const snapshot = await uploadBytes(ref(storage, storagePath), optimizedFile, {
        contentType: optimizedFile.type,
        cacheControl: "private, max-age=3600",
      });
      uploadedPaths.push(storagePath);
      images.push({
        path: storagePath,
        url: await getDownloadURL(snapshot.ref),
      });
    }
    return images;
  } catch (error) {
    const cleanupResults = await Promise.allSettled(
      uploadedPaths.map((path) => deleteObject(ref(storage, path)))
    );
    const cleanupFailure = cleanupResults.find((result) => result.status === "rejected");
    if (cleanupFailure) {
      throw new Error(
        `${error.message || "Product images could not be uploaded."} Some uploaded files could not be removed.`
      );
    }
    throw new Error(error.message || "Product images could not be uploaded.");
  }
}

export async function deleteMarketplaceProductImages(images) {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  const results = await Promise.allSettled(
    images.map(({ path }) => deleteObject(ref(storage, path)))
  );
  const failedDeletes = results.filter((result) => result.status === "rejected");
  if (failedDeletes.length > 0) {
    throw new Error(`${failedDeletes.length} product image(s) could not be removed.`);
  }
}

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (path, file) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw new Error(error.message || "Failed to upload file");
  }
};

/**
 * Get download URL of a file
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error(error.message || "Failed to get file URL");
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw new Error(error.message || "Failed to delete file");
  }
};

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (uid, file) => {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  if (!AVATAR_CONTENT_TYPES.includes(file?.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size === 0) {
    throw new Error("Choose an image file that is not empty.");
  }
  if (file.size > AVATAR_MAX_SIZE) {
    throw new Error("Profile pictures must be 5 MB or smaller.");
  }

  try {
    const storageRef = ref(storage, `avatars/${uid}/profile`);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: "private, no-cache, max-age=0, must-revalidate",
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    throw new Error(error.message || "Failed to upload avatar");
  }
};

export const deleteUserAvatar = async (uid) => {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  try {
    await deleteObject(ref(storage, `avatars/${uid}/profile`));
  } catch (error) {
    if (error.code !== "storage/object-not-found") {
      throw new Error(error.message || "Failed to remove profile picture");
    }
  }
};

export async function uploadIncidentEvidence(uid, reportId, evidenceId, file) {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  const constraints = INCIDENT_EVIDENCE_TYPES[file?.type];
  if (!constraints || file.size === 0 || file.size > constraints.maxSize) {
    throw new Error("This evidence file is not a supported type or size.");
  }

  const storagePath = `incidentEvidence/${uid}/${reportId}/${evidenceId}`;
  try {
    await uploadBytes(ref(storage, storagePath), file, {
      contentType: file.type,
      cacheControl: "private, no-cache, max-age=0, must-revalidate",
    });
    return {
      name: file.name.slice(0, 120),
      storagePath,
      contentType: file.type,
      kind: constraints.kind,
      size: file.size,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to upload incident evidence.");
  }
}

export async function getIncidentEvidenceBlob(storagePath, contentType, maxSize) {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  try {
    const bytes = await getBytes(ref(storage, storagePath), maxSize);
    return new Blob([bytes], { type: contentType });
  } catch (error) {
    throw new Error(error.message || "Failed to load incident evidence.");
  }
}

export async function deleteIncidentEvidence(storagePath) {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Check your Firebase project setup.");
  }
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if (error.code !== "storage/object-not-found") {
      throw new Error(error.message || "Failed to delete incident evidence.");
    }
  }
}
