export const MAX_INCIDENT_EVIDENCE_FILES = 3;
export const MAX_INCIDENT_EVIDENCE_TOTAL_SIZE = 45 * 1024 * 1024;
export const INCIDENT_EVIDENCE_TYPES = {
  "image/jpeg": { kind: "image", maxSize: 8 * 1024 * 1024 },
  "image/png": { kind: "image", maxSize: 8 * 1024 * 1024 },
  "image/webp": { kind: "image", maxSize: 8 * 1024 * 1024 },
  "video/mp4": { kind: "video", maxSize: 25 * 1024 * 1024 },
  "video/webm": { kind: "video", maxSize: 25 * 1024 * 1024 },
};

export function validateIncidentEvidence(files) {
  if (files.length > MAX_INCIDENT_EVIDENCE_FILES) {
    return `Attach no more than ${MAX_INCIDENT_EVIDENCE_FILES} files to one report.`;
  }

  let totalSize = 0;
  let imageCount = 0;
  let videoCount = 0;
  for (const file of files) {
    const constraints = INCIDENT_EVIDENCE_TYPES[file.type];
    if (!constraints) {
      return `${file.name} is not a supported image or video. Use JPEG, PNG, WebP, MP4, or WebM.`;
    }
    if (file.size === 0 || file.size > constraints.maxSize) {
      const maximumMb = constraints.maxSize / (1024 * 1024);
      return `${file.name} must be smaller than ${maximumMb} MB and not empty.`;
    }
    totalSize += file.size;
    if (constraints.kind === "video") videoCount += 1;
    else imageCount += 1;
  }

  if (imageCount > 2) {
    return "Attach no more than 2 images to a report.";
  }
  if (videoCount > 1) {
    return "Attach no more than one video to a report.";
  }
  if (totalSize > MAX_INCIDENT_EVIDENCE_TOTAL_SIZE) {
    return "The total evidence size must be 45 MB or less.";
  }
  return "";
}
