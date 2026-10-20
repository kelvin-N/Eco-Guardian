import { useState, useEffect, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import CO2Chart from "../../components/charts/CO2Chart";
import ActivityBreakdown from "../../components/charts/ActivityBreakdown";
import WasteBreakdown from "../../components/charts/WasteBreakdown";
import MonthlyGoalsProgress from "../goals/MonthlyGoalsProgress";
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
    const getDate = (item) => (
      item.createdAt?.toDate
        ? item.createdAt.toDate()
        : item.createdAt
          ? new Date(item.createdAt)
          : null
    );
    const withinDays = (item, days) => {
      const date = getDate(item);
      return date && !Number.isNaN(date.getTime())
        && date <= now
        && now - date < days * day;
    };

    const periodDays = { week: 7, month: 30, year: 365 };
    return Object.fromEntries(
      Object.entries(periodDays).map(([period, days]) => {
        const activities = rawStats.activities.filter((activity) => withinDays(activity, days));
        const waste = rawStats.waste.filter((report) => withinDays(report, days));
        return [period, {
          activities: activities.length,
          wasteLogged: waste.reduce((total, report) => total + (Number(report.amount) || 0), 0),
          co2Saved: activities.reduce((total, activity) => total + (Number(activity.co2) || 0), 0),
          points:
            activities.reduce((total, activity) => total + (Number(activity.points) || 0), 0)
            + waste.length * 5,
        }];
      })
    );
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
          <Motion.h1
            className="eco-heading-2xl mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📊 Environmental Analytics
          </Motion.h1>
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
          <Motion.div
            className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={timeFrame}
          >
            <Card>
              <p className="eco-text-muted text-sm">Estimated CO₂ savings</p>
              <p className="eco-heading-lg text-eco-600">
                {currentStats.co2Saved} kg
              </p>
              <p className="text-xs eco-text-muted mt-2">
                Based on your self-reported activity entries; not independently verified.
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
          </Motion.div>

          <div className="mb-6">
            <MonthlyGoalsProgress
              key={currentUser.uid}
              userId={currentUser.uid}
            />
          </div>

          {/* CO2 Timeline Chart */}
          {!loading && rawStats.activities.length > 0 && (
            <Card className="mb-6">
              <h2 className="eco-heading-lg mb-1">📈 Estimated CO₂ savings timeline</h2>
              <p className="eco-text-subtle mb-4">Based on your self-reported activity entries.</p>
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
