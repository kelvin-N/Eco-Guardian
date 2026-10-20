import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  addWasteReport,
  getWasteReports,
  checkAndAwardBadges,
} from "../../services/ecoService";

export default function WasteReporting() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState("Plastic");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const wasteTypes = ["Plastic", "Paper", "Metal", "Glass", "Organic", "E-waste"];

  const addReport = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const weight = Number(amount);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 10000) {
      setError("Enter a waste amount greater than 0 and no more than 10,000 kg.");
      return;
    }
    if (location.trim().length > 120) {
      setError("Location must be 120 characters or fewer.");
      return;
    }
    if (!userId) {
      setError("Sign in to submit a waste report.");
      return;
    }

    setSubmitting(true);
    try {
      await addWasteReport(userId, type, weight, location.trim());
      setReports((previous) => [
        {
          id: typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${previous.length}`,
        type,
          amount: weight,
          location: location.trim() || "Location not specified",
          createdAt: new Date(),
        },
        ...previous,
      ]);
      setAmount("");
      setLocation("");
      setSuccess("Your waste report was saved.");
      await checkAndAwardBadges(userId);
    } catch (saveError) {
      console.error("Failed to add waste report:", saveError);
      setError("Your report could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setReports([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    getWasteReports(userId)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("Failed to fetch waste reports:", loadError);
        setError("Your reports could not be loaded. Please refresh and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formatReportDate = (report) => {
    const date = report.createdAt?.toDate
      ? report.createdAt.toDate()
      : report.createdAt instanceof Date
        ? report.createdAt
        : null;
    return date ? date.toLocaleString() : "Date unavailable";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
        <div className="eco-container">
          <Motion.h1
            className="eco-heading-2xl mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ♻️ Waste Reporting System
          </Motion.h1>
          <p className="eco-text-muted mb-6">
            Report waste you've recycled or cleaned up in your community.
          </p>

          {/* Stats */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : (
            <Motion.div
              className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
            <Card>
              <p className="eco-text-muted text-sm">Total Reported</p>
              <p className="eco-heading-lg text-eco-600">
                {reports.reduce((sum, report) => sum + (Number(report.amount) || 0), 0).toFixed(1)} kg
              </p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Reports Made</p>
              <p className="eco-heading-lg">{reports.length}</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Points Earned</p>
              <p className="eco-heading-lg text-green-600">{reports.length * 5}</p>
            </Card>
          </Motion.div>
          )}

          {/* Report List */}
          <Card className="mb-6">
            <h2 className="eco-heading-lg mb-4">Your Reports</h2>
            {!loading && reports.length === 0 && (
              <p className="eco-text-muted">You have not submitted a waste report yet.</p>
            )}
            <div className="space-y-3">
              {reports.map((report, idx) => (
                <Motion.div
                  key={report.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-xs eco-text-muted">
                      {report.location || "Location not specified"} • {formatReportDate(report)}
                    </p>
                  </div>
                  <p className="text-eco-600 font-semibold">{Number(report.amount || 0).toFixed(1)} kg</p>
                </Motion.div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="eco-heading-lg mb-4">Submit a Waste Report</h2>
            <p className="eco-text-muted text-sm mb-4">
              Enter the type and measured weight of waste you collected or recycled.
            </p>
            <form onSubmit={addReport} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Waste type
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="eco-input mt-2"
                  >
                    {wasteTypes.map((wasteType) => (
                      <option key={wasteType} value={wasteType}>{wasteType}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Weight (kg)
                  <input
                    type="number"
                    min="0.1"
                    max="10000"
                    step="0.1"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="eco-input mt-2"
                    placeholder="e.g. 2.5"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Location (optional)
                <input
                  type="text"
                  maxLength={120}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="eco-input mt-2"
                  placeholder="Neighborhood or collection site"
                />
              </label>
              {error && <p className="eco-alert-error" role="alert">{error}</p>}
              {success && <p className="eco-alert-success" role="status">{success}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving report..." : "Submit report"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
