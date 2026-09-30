import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import CO2Chart from "../../components/charts/CO2Chart";
import ActivityBreakdown from "../../components/charts/ActivityBreakdown";
import WasteBreakdown from "../../components/charts/WasteBreakdown";
import {
  getCarbonActivities,
  getWasteReports,
} from "../../services/ecoService";

export default function EnvironmentalAnalytics() {
  const { currentUser } = useAuth();
  const [timeFrame, setTimeFrame] = useState("month");
  const [loading, setLoading] = useState(true);

  const [rawStats, setRawStats] = useState({ activities: [], waste: [] });
  

  const computedStats = useMemo(() => {
    const now = new Date();
    const day = 1000 * 60 * 60 * 24;
    const computeCounts = (items) => {
      return items.reduce(
        (tot, item) => {
          const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : now;
          const diff = now - itemDate;
          if (diff < 7 * day) tot.week++;
          if (diff < 30 * day) tot.month++;
          if (diff < 365 * day) tot.year++;
          return tot;
        },
        { week: 0, month: 0, year: 0 }
      );
    };

    const activityCounts = computeCounts(rawStats.activities);

    const wasteLogged = rawStats.waste.reduce((s, w) => s + (w.amount || 0), 0);
    const co2Saved = rawStats.activities.reduce((s, a) => s + (a.co2 || 0), 0);
    const points =
      rawStats.activities.reduce((s, a) => s + (a.points || 0), 0) +
      rawStats.waste.length * 5;

    return {
      week: {
        activities: activityCounts.week,
        wasteLogged,
        co2Saved,
        points,
      },
      month: {
        activities: activityCounts.month,
        wasteLogged,
        co2Saved,
        points,
      },
      year: {
        activities: activityCounts.year,
        wasteLogged,
        co2Saved,
        points,
      },
    };
  }, [rawStats]);

  const currentStats = computedStats[timeFrame];

  useEffect(() => {
    if (!currentUser) return;
    // load activities and waste then compute simple totals
    Promise.all([
      getCarbonActivities(currentUser.uid),
      getWasteReports(currentUser.uid),
    ])
      .then(([acts, waste]) => setRawStats({ activities: acts, waste }))
      .catch((err) => console.error("analytics load error", err))
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
            📊 Environmental Analytics
          </motion.h1>
          <p className="eco-text-muted mb-6">
            Detailed insights into your environmental impact.
          </p>

          {/* Time Frame Toggle */}
          <div className="mb-6 flex gap-2">
            {["week", "month", "year"].map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? "primary" : "outline"}
                onClick={() => setTimeFrame(tf)}
                className="capitalize"
              >
                {tf}
              </Button>
            ))}
          </div>          {loading && (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          )}
          {/* Main Stats Grid */}
          <motion.div
            className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={timeFrame}
          >
            <Card>
              <p className="eco-text-muted text-sm">CO₂ Saved</p>
              <p className="eco-heading-lg text-eco-600">
                {currentStats.co2Saved} kg
              </p>
              <p className="text-xs eco-text-muted mt-2">
                Equivalent to {(currentStats.co2Saved / 20).toFixed(1)} trees
              </p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Waste Logged</p>
              <p className="eco-heading-lg text-green-600">
                {currentStats.wasteLogged} kg
              </p>
              <p className="text-xs eco-text-muted mt-2">
                Diverted from landfills
              </p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Activities</p>
              <p className="eco-heading-lg text-blue-600">
                {currentStats.activities}
              </p>
              <p className="text-xs eco-text-muted mt-2">Eco actions taken</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Points Earned</p>
              <p className="eco-heading-lg text-amber-600">
                {currentStats.points}
              </p>
              <p className="text-xs eco-text-muted mt-2">Keep it up!</p>
            </Card>
          </motion.div>

          {/* Impact Summary */}
          <Card className="mb-6">
            <h2 className="eco-heading-lg mb-4">Your Impact</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>CO₂ Reduction Progress</span>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-eco-500 h-3 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Waste Reduction Goal</span>
                  <span className="font-semibold">60%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* CO2 Timeline Chart */}
          {!loading && rawStats.activities.length > 0 && (
            <Card className="mb-6">
              <h2 className="eco-heading-lg mb-4">📈 CO₂ Savings Timeline</h2>
              <CO2Chart carbonActivities={rawStats.activities} />
            </Card>
          )}

          {/* Activity Type Breakdown */}
          {!loading && rawStats.activities.length > 0 && (
            <Card className="mb-6">
              <h2 className="eco-heading-lg mb-4">🎯 Top Activities</h2>
              <ActivityBreakdown carbonActivities={rawStats.activities} />
            </Card>
          )}

          {/* Waste Breakdown Chart */}
          {!loading && rawStats.waste.length > 0 && (
            <Card className="mb-6">
              <h2 className="eco-heading-lg mb-4">♻️ Waste by Type</h2>
              <WasteBreakdown wasteReports={rawStats.waste} />
            </Card>
          )}

          {loading && (
            <Card className="text-center py-20">
              <p className="eco-text-muted">Loading analytics...</p>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
