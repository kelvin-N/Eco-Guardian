import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getIncidentEvidenceBlob } from "../../firebase/storage";
import {
  deleteIncidentReportEvidence,
  getAllIncidentReports,
  getIncidentReportEvidence,
  getUserIncidentReports,
  updateIncidentReportStatus,
} from "../../services/communityService";
import { INCIDENT_EVIDENCE_TYPES } from "../../services/incidentEvidence";

const REPORT_STATUSES = ["open", "in_review", "resolved", "rejected"];
const STATUS_LABELS = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  rejected: "Rejected",
};

function formatReportDate(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : timestamp ? new Date(timestamp) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString()
    : "Date unavailable";
}

function IncidentEvidence({ evidence, onRemove }) {
  const [objectUrl, setObjectUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const loadEvidence = async () => {
    const constraints = INCIDENT_EVIDENCE_TYPES[evidence.contentType];
    if (
      !constraints
      || typeof evidence.storagePath !== "string"
      || !evidence.storagePath.startsWith("incidentEvidence/")
    ) {
      setError("This attachment has invalid file information.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const blob = await getIncidentEvidenceBlob(
        evidence.storagePath,
        evidence.contentType,
        constraints.maxSize
      );
      setObjectUrl(URL.createObjectURL(blob));
    } catch (loadError) {
      console.error("Failed to load incident evidence:", loadError);
      setError(loadError.message || "Evidence could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const removeEvidence = async () => {
    if (!window.confirm("Remove this evidence file? This cannot be undone.")) return;
    setLoading(true);
    setError("");
    try {
      await deleteIncidentReportEvidence(
        evidence.reportId,
        evidence.id,
        evidence.storagePath
      );
      setObjectUrl("");
      onRemove(evidence.id);
    } catch (deleteError) {
      console.error("Failed to remove incident evidence:", deleteError);
      setError(deleteError.message || "Evidence could not be removed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {evidence.kind === "video" ? "🎬" : "🖼️"} {evidence.name}
          </p>
          <p className="text-xs eco-text-subtle">
            {(evidence.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        {!objectUrl && (
          <Button type="button" size="sm" variant="outline" disabled={loading} onClick={loadEvidence}>
            {loading ? "Loading…" : "View privately"}
          </Button>
        )}
      </div>
      {objectUrl && evidence.kind === "image" && (
        <img
          src={objectUrl}
          alt={`Evidence submitted with ${evidence.reportType} report`}
          className="mt-3 max-h-96 max-w-full rounded-lg object-contain"
        />
      )}
      {objectUrl && evidence.kind === "video" && (
        <video
          src={objectUrl}
          controls
          playsInline
          preload="metadata"
          className="mt-3 max-h-96 max-w-full rounded-lg"
        >
          Your browser cannot play this video.
        </video>
      )}
      {objectUrl && (
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="text-sm font-medium text-eco-700 hover:underline dark:text-eco-300"
            onClick={() => setObjectUrl("")}
          >
            Close preview
          </button>
          {!evidence.adminView && (
            <button
              type="button"
              className="text-sm text-red-600 hover:underline dark:text-red-400"
              disabled={loading}
              onClick={removeEvidence}
            >
              Remove evidence
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </li>
  );
}

export default function ReportsList({ adminView = false }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyReportId, setBusyReportId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReports = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const reportsData = adminView
        ? await getAllIncidentReports()
        : await getUserIncidentReports(userId);
      const data = await Promise.all(reportsData.map(async (report) => ({
        ...report,
        evidence: await getIncidentReportEvidence(report.id),
      })));
      setReports(data);
      setError("");
    } catch (loadError) {
      console.error("Failed to load incident reports:", loadError);
      setError(loadError.message || "Incident reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [adminView, userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const changeStatus = async (reportId, status) => {
    setBusyReportId(reportId);
    setError("");
    setMessage("");
    try {
      await updateIncidentReportStatus(reportId, status);
      setReports((previous) =>
        previous.map((report) =>
          report.id === reportId ? { ...report, status } : report
        )
      );
      setMessage("Incident report status updated.");
    } catch (updateError) {
      console.error("Failed to update incident report:", updateError);
      setError(updateError.message || "Incident status could not be updated.");
    } finally {
      setBusyReportId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-eco-700 dark:text-eco-300">
                  {adminView ? "Administration" : "Community care"}
                </p>
                <h1 className="eco-heading-xl mt-2">
                  {adminView ? "Incident reports" : "My incident reports"}
                </h1>
                <p className="eco-text-muted mt-2">
                  {adminView
                    ? "Review community-submitted environmental reports and update their status."
                    : "Review the status of environmental incidents you have reported."}
                </p>
              </div>
              {adminView ? (
                <Button type="button" variant="outline" onClick={loadReports} disabled={loading}>
                  Refresh reports
                </Button>
              ) : (
                <Link to="/report-incident" className="eco-btn-primary">
                  Report an incident
                </Link>
              )}
            </div>

            {error && <p className="eco-alert-error mb-5" role="alert">{error}</p>}
            {message && <p className="eco-alert-success mb-5" role="status">{message}</p>}

            {loading ? (
              <div className="flex justify-center py-16"><Loader size="lg" /></div>
            ) : reports.length === 0 ? (
              <Card>
                <p className="eco-text-muted">
                  {adminView ? "There are no incident reports to review." : "You have not submitted an incident report yet."}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="eco-heading-md">{report.type}</h2>
                          <span className="eco-badge-info">
                            {STATUS_LABELS[report.status] || "Unknown"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium">📍 {report.location}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm eco-text-muted">
                          {report.description}
                        </p>
                        <p className="mt-3 text-xs eco-text-subtle">
                          Submitted {formatReportDate(report.createdAt)}
                          {adminView && ` · Reporter ${report.uid}`}
                        </p>
                        {report.evidence?.length > 0 && (
                          <div className="mt-5">
                            <h3 className="mb-2 text-sm font-semibold">
                              Evidence ({report.evidence.length})
                            </h3>
                            <ul className="space-y-2">
                              {report.evidence.map((item) => (
                                <IncidentEvidence
                                  key={item.id}
                                  evidence={{
                                    ...item,
                                    reportType: report.type,
                                    adminView,
                                    reportId: report.id,
                                  }}
                                  onRemove={(evidenceId) => setReports((previous) => (
                                      previous.map((currentReport) => currentReport.id === report.id
                                        ? {
                                          ...currentReport,
                                          evidence: currentReport.evidence.filter(
                                            (currentEvidence) => currentEvidence.id !== evidenceId
                                          ),
                                        }
                                        : currentReport)
                                    ))}
                                />
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {adminView && (
                        <label className="text-sm font-medium">
                          Status
                          <select
                            value={report.status}
                            disabled={busyReportId === report.id}
                            onChange={(event) => changeStatus(report.id, event.target.value)}
                            className="eco-input mt-2 min-w-36"
                          >
                            {REPORT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
