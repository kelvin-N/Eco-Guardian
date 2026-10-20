import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { motion as Motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import CO2Chart from "../../components/charts/CO2Chart";
import Leaderboard from "../leaderboard/Leaderboard";
import {
  BADGE_DEFINITIONS,
  getCarbonActivities,
  getUserBadges,
  getWasteReports,
} from "../../services/ecoService";
import MonthlyGoalsProgress from "../goals/MonthlyGoalsProgress";

function toDate(timestamp) {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return timestamp ? new Date(timestamp) : null;
}

function ActivityLog({ activities, loading, error }) {
  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="eco-heading-sm">Recent Activity</h3>
      </div>
      {loading ? (
        <p className="eco-text-muted" role="status">Loading your activity...</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      ) : activities.length === 0 ? (
        <p className="eco-text-muted">Your logged carbon and waste activities will appear here.</p>
      ) : (
        <div className="space-y-3">
        {activities.slice(0, 5).map((activity, i) => (
          <Motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{activity.icon}</span>
              <div>
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs eco-text-subtle">
                  {toDate(activity.createdAt)?.toLocaleString() || "Date unavailable"}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium">+{activity.points} pts</span>
          </Motion.div>
        ))}
        </div>
      )}
    </Card>
  );
}

function Achievements({ achievements, loading, error }) {
  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏅</span>
        <h3 className="eco-heading-sm">Achievements</h3>
      </div>
      {loading ? (
        <p className="eco-text-muted" role="status">Loading your achievements...</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      ) : achievements.length === 0 ? (
        <p className="eco-text-muted">No achievements unlocked yet. Keep logging eco activities!</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, i) => (
          <Motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 bg-gradient-to-br from-eco-50 to-blue-50 dark:from-eco-900/20 dark:to-blue-900/20 rounded-lg text-center hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">{achievement.icon}</div>
            <p className="text-xs font-semibold">{achievement.name}</p>
            <p className="text-xs eco-text-subtle">{achievement.description}</p>
          </Motion.div>
        ))}
        </div>
      )}
    </Card>
  );
}

// Dashboard Main Component
export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const userId = currentUser?.uid;
  const navigate = useNavigate();
  const [carbonActivities, setCarbonActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [activityLoadError, setActivityLoadError] = useState(null);
  const activityLoading = Boolean(db && userId && loadedUserId !== userId);
  const activityError =
    activityLoadError?.userId === userId ? activityLoadError.message : "";

  useEffect(() => {
    if (!userId || !db) return;

    let cancelled = false;
    Promise.all([
      getCarbonActivities(userId),
      getWasteReports(userId),
      getUserBadges(userId),
    ])
      .then(([carbon, waste, badges]) => {
        if (cancelled) return;
        setCarbonActivities(carbon);
        const activities = [
          ...carbon.map((record) => ({
            id: `carbon-${record.id}`,
            icon: "🌱",
            action: record.activity,
            points: record.points || 0,
            createdAt: record.createdAt,
          })),
          ...waste.map((record) => ({
            id: `waste-${record.id}`,
            icon: "♻️",
            action: `${record.type} waste reported`,
            points: 5,
            createdAt: record.createdAt,
          })),
        ].sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
        setRecentActivities(activities);
        setAchievements(
          badges
            .map((badge) => BADGE_DEFINITIONS[badge.badgeId])
            .filter(Boolean)
        );
        setActivityLoadError(null);
        setLoadedUserId(userId);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load dashboard activity:", error);
        setActivityLoadError({
          userId,
          message: "Dashboard activity could not be loaded. Please try again later.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoadedUserId(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const actionsThisWeek = recentActivities.filter((activity) => {
    const date = toDate(activity.createdAt);
    return date && date >= weekAgo && date <= now;
  }).length;
  const totalCO2Saved = carbonActivities.reduce(
    (sum, activity) => sum + (Number(activity.co2) || 0),
    0
  );
  const activeDays = new Set(
    recentActivities
      .map((activity) => toDate(activity.createdAt))
      .filter(Boolean)
      .map((date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  let streak = 0;
  const latestActivity = [...recentActivities]
    .map((activity) => toDate(activity.createdAt))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  if (
    latestActivity &&
    latestActivity >= yesterday &&
    latestActivity < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const day = new Date(today);
    if (latestActivity < today) day.setDate(day.getDate() - 1);
    while (activeDays.has(`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`)) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-12">
        <div className="eco-container">
          {/* Welcome Section */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="eco-heading-xl mb-2">
                  Welcome back, {currentUser.email?.split("@")[0]}! 🌱
                </h1>
                <p className="eco-text-muted text-lg">
                  You're making a difference every day. Keep up the amazing work!
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => navigate("/carbon")}>
                  + Log Activity
                </Button>
                <Button variant="outline" onClick={() => navigate("/report-incident")}>
                  Report Incident
                </Button>
                <Button variant="outline" onClick={() => navigate("/reports")}>
                  My Reports
                </Button>
              </div>
            </div>
          </Motion.div>

          {/* Stats Cards */}
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🌟</div>
                  <p className="eco-text-subtle mb-1">Eco Score</p>
                  <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                    {userProfile?.ecoScore ?? 0}
                  </p>
                </div>
              </Card>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🌍</div>
                  <p className="eco-text-subtle mb-1">Estimated CO₂ savings</p>
                  <p className="eco-heading-lg text-orange-600 dark:text-orange-400">
                    {totalCO2Saved.toFixed(1)} kg
                  </p>
                </div>
              </Card>
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">📊</div>
                  <p className="eco-text-subtle mb-1">Actions (7 days)</p>
                  <p className="eco-heading-lg text-blue-600 dark:text-blue-400">
                    {actionsThisWeek}
                  </p>
                </div>
              </Card>
            </Motion.div>
            <Motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🔥</div>
                  <p className="eco-text-subtle mb-1">Current Streak</p>
                  <p className="eco-heading-lg text-orange-600 dark:text-orange-400">
                    {streak} {streak === 1 ? "day" : "days"}
                  </p>
                </div>
              </Card>
            </Motion.div>
          </Motion.div>

          {/* Main Content Grid */}
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Left Column */}
            <Motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {/* CO2 Chart */}
              {carbonActivities.length > 0 && (
                <Card>
                  <h2 className="eco-heading-lg mb-1">📈 Your estimated CO₂ savings</h2>
                  <p className="eco-text-subtle mb-4">Based on your self-reported activity entries.</p>
                  <CO2Chart carbonActivities={carbonActivities} />
                </Card>
              )}
              <MonthlyGoalsProgress
                key={currentUser.uid}
                userId={currentUser.uid}
              />
              <ActivityLog
                activities={recentActivities}
                loading={activityLoading}
                error={activityError}
              />
            </Motion.div>

            {/* Right Column */}
            <Motion.div variants={itemVariants}>
              <Achievements
                achievements={achievements}
                loading={activityLoading}
                error={activityError}
              />
            </Motion.div>
          </Motion.div>

          {/* Leaderboard Section */}
          <Motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Leaderboard />
          </Motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
