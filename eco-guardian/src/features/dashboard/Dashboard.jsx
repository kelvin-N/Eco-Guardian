import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import CO2Chart from "../../components/charts/CO2Chart";
import Leaderboard from "../leaderboard/Leaderboard";
import { getCarbonActivities } from "../../services/ecoService";

// Activity Log Component
function ActivityLog() {
  const activities = [
    { icon: "🚴", action: "Took a bike ride", time: "2 hours ago" },
    { icon: "♻️", action: "Recycled plastic", time: "4 hours ago" },
    { icon: "🌱", action: "Planted a tree", time: "1 day ago" },
  ];

  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="eco-heading-sm">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activity.icon}</span>
              <div>
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs eco-text-subtle">{activity.time}</p>
              </div>
            </div>
            <span className="text-xl">+10 pts</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// Achievements Component
function Achievements() {
  const achievements = [
    { icon: "🥇", title: "First Steps", desc: "Complete your first eco-action" },
    { icon: "🌟", title: "Eco-Star", desc: "Reach 100 eco-points" },
    { icon: "🔥", title: "On Fire", desc: "7-day streak" },
    { icon: "👑", title: "Legend", desc: "Reach #1 on leaderboard" },
  ];

  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏅</span>
        <h3 className="eco-heading-sm">Achievements</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 bg-gradient-to-br from-eco-50 to-blue-50 dark:from-eco-900/20 dark:to-blue-900/20 rounded-lg text-center hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl mb-2">{ach.icon}</div>
            <p className="text-xs font-semibold">{ach.title}</p>
            <p className="text-xs eco-text-subtle">{ach.desc}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// Goal Progress Component
function GoalProgress() {
  const goals = [
    { label: "Carbon Offset", current: 45, target: 100, icon: "💨" },
    { label: "Waste Reduced", current: 12, target: 50, icon: "♻️" },
    { label: "Trees Planted", current: 8, target: 25, icon: "🌱" },
  ];

  return (
    <Card elevated>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="eco-heading-sm">Goals Progress</h3>
      </div>
      <div className="space-y-4">
        {goals.map((goal, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                {goal.icon} {goal.label}
              </span>
              <span className="eco-badge-success">
                {goal.current}/{goal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-eco-400 to-eco-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// Dashboard Main Component
export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [_users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ecoScore, setEcoScore] = useState(0);
  const [rank, setRank] = useState("-");
  const [carbonActivities, setCarbonActivities] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    if (!db) {
      setUsers([]);
      setRank("-");
      setEcoScore(0);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users"), orderBy("ecoScore", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      const idx = usersData.findIndex((u) => u.id === currentUser.uid);
      setRank(idx === -1 ? "-" : idx + 1);

      const userScore = usersData.find((u) => u.id === currentUser.uid)
        ?.ecoScore || 0;
      setEcoScore(userScore);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load carbon activities for chart
  useEffect(() => {
    if (!currentUser) return;
    if (!db) {
      setCarbonActivities([]);
      return;
    }

    getCarbonActivities(currentUser.uid)
      .then((acts) => setCarbonActivities(acts))
      .catch((err) => console.error("failed to load activities", err));
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

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

  const rankLabel = rank === "-" ? "New" : `#${rank}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-12">
        <div className="eco-container">
          {/* Welcome Section */}
          <motion.div
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
              <Button variant="secondary" onClick={() => navigate("/carbon")}>
                + Log Activity
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🏆</div>
                  <p className="eco-text-subtle mb-1">Your Rank</p>
                  <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                    {rankLabel}
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🌟</div>
                  <p className="eco-text-subtle mb-1">Eco Score</p>
                  <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                    {ecoScore}
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">🔥</div>
                  <p className="eco-text-subtle mb-1">Current Streak</p>
                  <p className="eco-heading-lg text-orange-600 dark:text-orange-400">
                    7 days
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevated>
                <div className="text-center">
                  <div className="text-5xl mb-2">📊</div>
                  <p className="eco-text-subtle mb-1">Actions This Week</p>
                  <p className="eco-heading-lg text-blue-600 dark:text-blue-400">
                    5
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Left Column */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {/* CO2 Chart */}
              {carbonActivities.length > 0 && (
                <Card>
                  <h2 className="eco-heading-lg mb-4">📈 Your CO₂ Savings</h2>
                  <CO2Chart carbonActivities={carbonActivities} />
                </Card>
              )}
              <GoalProgress />
              <ActivityLog />
            </motion.div>

            {/* Right Column */}
            <motion.div variants={itemVariants}>
              <Achievements />
            </motion.div>
          </motion.div>

          {/* Leaderboard Section */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Leaderboard />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
