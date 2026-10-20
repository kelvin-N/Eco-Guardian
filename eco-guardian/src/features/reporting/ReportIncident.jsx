import { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { createIncidentReport } from "../../services/communityService";
import {
  MAX_INCIDENT_EVIDENCE_FILES,
  MAX_INCIDENT_EVIDENCE_TOTAL_SIZE,
  validateIncidentEvidence,
} from "../../services/incidentEvidence";

const INCIDENT_TYPES = [
  "Illegal dumping",
  "Water pollution",
  "Air pollution",
  "Wildlife concern",
  "Tree or habitat damage",
  "Other",
];

const EMPTY_REPORT = { type: INCIDENT_TYPES[0], location: "", description: "" };

export default function ReportIncident() {
  const { currentUser } = useAuth();
  const [report, setReport] = useState(EMPTY_REPORT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const submitReport = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!currentUser) {
      setError("Sign in to submit an incident report.");
      return;
    }

    setSubmitting(true);
    try {
      await createIncidentReport(currentUser.uid, {
        type: report.type,
        location: report.location.trim(),
        description: report.description.trim(),
      }, evidenceFiles);
      setReport(EMPTY_REPORT);
      setEvidenceFiles([]);
      setSuccess("Your report was submitted. You can follow its status and view attached evidence in My Reports.");
    } catch (submitError) {
      console.error("Failed to submit incident report:", submitError);
      if (submitError.reportSubmitted) {
        setReport(EMPTY_REPORT);
        setEvidenceFiles([]);
        setSuccess(`Your report was submitted without its evidence (report ${submitError.reportId}).`);
      }
      setError(submitError.message || "Your report could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidenceChange = (event) => {
    const selectedFiles = [...event.target.files];
    event.target.value = "";
    const nextFiles = [...evidenceFiles, ...selectedFiles];
    const validationError = validateIncidentEvidence(nextFiles);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setEvidenceFiles(nextFiles);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container max-w-3xl">
          <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold uppercase tracking-wider text-eco-700 dark:text-eco-300">
              Community care
            </p>
            <h1 className="eco-heading-xl mt-2">Report an environmental incident</h1>
            <p className="eco-text-muted mt-3">
              Share a location and clear details so an administrator can review your report.
              Do not submit emergencies here; contact local emergency services.
            </p>

            <Card className="mt-6">
              <form onSubmit={submitReport} className="space-y-5">
                <label className="block text-sm font-medium">
                  Incident type
                  <select
                    value={report.type}
                    onChange={(event) => setReport({ ...report, type: event.target.value })}
                    className="eco-input mt-2"
                  >
                    {INCIDENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Location
                  <input
                    required
                    maxLength={160}
                    value={report.location}
                    onChange={(event) => setReport({ ...report, location: event.target.value })}
                    className="eco-input mt-2"
                    placeholder="Street, park, or nearby landmark"
                  />
                </label>
                <label className="block text-sm font-medium">
                  What happened?
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                    value={report.description}
                    onChange={(event) => setReport({ ...report, description: event.target.value })}
                    className="eco-input mt-2"
                    placeholder="Describe what you observed, including when it happened if known."
                  />
                </label>
                <div>
                  <label htmlFor="incident-evidence" className="block text-sm font-medium">
                    Photos or video <span className="font-normal eco-text-subtle">(optional)</span>
                  </label>
                  <p className="mt-1 text-sm eco-text-muted">
                    Attach up to 2 JPEG, PNG, or WebP images (8 MB each) and
                    one MP4/WebM video (25 MB). Total size must be{" "}
                    {(MAX_INCIDENT_EVIDENCE_TOTAL_SIZE / (1024 * 1024)).toFixed(0)} MB or less.
                  </p>
                  <input
                    id="incident-evidence"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    multiple
                    onChange={handleEvidenceChange}
                    disabled={submitting || evidenceFiles.length >= MAX_INCIDENT_EVIDENCE_FILES}
                    className="eco-input mt-2"
                  />
                  {evidenceFiles.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {evidenceFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800"
                        >
                          <span className="min-w-0 truncate">
                            {file.type.startsWith("video/") ? "🎬" : "🖼️"} {file.name}
                            <span className="ml-2 eco-text-subtle">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </span>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => setEvidenceFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))}
                            className="shrink-0 text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                            aria-label={`Remove ${file.name}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-xs eco-text-subtle">
                    Evidence is private to you and authorized administrators. Files may contain embedded location/device metadata; avoid including identifiable people or sensitive personal details.
                  </p>
                </div>
                {error && <p className="eco-alert-error" role="alert">{error}</p>}
                {success && (
                  <div className="eco-alert-success" role="status">
                    <span>{success}</span>
                    <Link to="/reports" className="font-semibold underline">View my reports</Link>
                  </div>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit incident report"}
                </Button>
              </form>
            </Card>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
