import { useState, useEffect } from "react";
import { motion } from "framer-motion";

let __idCounter = 1;
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const wasteTypes = ["Plastic", "Paper", "Metal", "Glass", "Organic", "E-waste"];

  const addReport = async (type, amount, location) => {
    if (!currentUser) return;
    try {
      await addWasteReport(currentUser.uid, type, amount, location);
        const newReport = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-fallback-${__idCounter++}`,
        type,
        amount,
        location,
        date: "Today",
      };
      setReports((prev) => [newReport, ...prev]);
      // check if any badges were unlocked
      await checkAndAwardBadges(currentUser.uid);
    } catch (err) {
      console.error("failed to add waste report", err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    getWasteReports(currentUser.uid)
      .then((data) => setReports(data))
      .catch((err) => console.error("failed to fetch waste reports", err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
        <div className="eco-container">
          <motion.h1
            className="eco-heading-2xl mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ♻️ Waste Reporting System
          </motion.h1>
          <p className="eco-text-muted mb-6">
            Report waste you've recycled or cleaned up in your community.
          </p>

          {/* Stats */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : (
            <motion.div
              className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
            <Card>
              <p className="eco-text-muted text-sm">Total Reported</p>
              <p className="eco-heading-lg text-eco-600">
                {reports.reduce((sum, r) => sum + r.amount, 0).toFixed(1)} kg
              </p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Reports Made</p>
              <p className="eco-heading-lg">{reports.length}</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Points Earned</p>
              <p className="eco-heading-lg text-green-600">
                {reports.length * 5}
              </p>
            </Card>
          </motion.div>
          )}

          {/* Report List */}
          <Card className="mb-6">
            <h2 className="eco-heading-lg mb-4">Your Reports</h2>
            <div className="space-y-3">
              {reports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-xs eco-text-muted">
                      {report.location} • {report.date}
                    </p>
                  </div>
                  <p className="text-eco-600 font-semibold">{report.amount} kg</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Quick Report */}
          <Card>
            <h2 className="eco-heading-lg mb-4">Quick Report Waste</h2>
            <p className="eco-text-muted text-sm mb-4">
              Select a type and we'll help you log it:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {wasteTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="text-sm"
                  onClick={() => addReport(type, Math.random() * 10, "Community")}
                >
                  {type}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
