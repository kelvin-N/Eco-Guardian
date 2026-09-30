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
  addCarbonActivity,
  getCarbonActivities,
  checkAndAwardBadges,
} from "../../services/ecoService";

export default function CarbonTracker() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [totalCO2Saved, setTotalCO2Saved] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch persisted activities when user logs in
  useEffect(() => {
    if (!currentUser) return;
    getCarbonActivities(currentUser.uid)
      .then((data) => setActivities(data))
      .catch((err) => console.error("failed to load carbon activities", err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    const total = activities.reduce((sum, a) => sum + (a.co2 || 0), 0);
    setTotalCO2Saved(total);
  }, [activities]);

  const addActivity = async (activityName, co2Amount) => {
    if (!currentUser) return;
    try {
      const points = Math.round(co2Amount); // 1 point per kg CO2
      await addCarbonActivity(currentUser.uid, activityName, co2Amount, points);
      const newActivity = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-fallback-${__idCounter++}`,
        name: activityName,
        co2: co2Amount,
        date: "Today",
      };
      setActivities((prev) => [newActivity, ...prev]);
      // check if any badges were unlocked
      await checkAndAwardBadges(currentUser.uid);
    } catch (err) {
      console.error("error adding activity", err);
    }
  };

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
            🌱 Carbon Footprint Tracker
          </motion.h1>
          <p className="eco-text-muted mb-6">
            Track the carbon emissions you've saved through eco-friendly activities.
          </p>

          {/* Stats Card */}
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
              <p className="eco-text-muted text-sm">Total CO₂ Saved</p>
              <p className="eco-heading-lg text-eco-600">{totalCO2Saved.toFixed(1)} kg</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Activities Logged</p>
              <p className="eco-heading-lg">{activities.length}</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Equivalent Trees</p>
              <p className="eco-heading-lg text-green-600">{(totalCO2Saved / 20).toFixed(1)}</p>
            </Card>
          </motion.div>
          )}

          {/* Activity List */}
          <Card>
            <h2 className="eco-heading-lg mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-xs eco-text-muted">{activity.date}</p>
                  </div>
                  <p className="text-eco-600 font-semibold">{activity.co2} kg CO₂</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Quick Add */}
          <Card className="mt-6">
            <h2 className="eco-heading-lg mb-4">Quick Add Activity</h2>
            <div className="space-y-3">
              {[
                { name: "Biking to work", co2: 2.5 },
                { name: "Public transit", co2: 1.8 },
                { name: "Meat-free meal", co2: 0.5 },
                { name: "Carpooling", co2: 3.2 },
              ].map((activity) => (
                <Button
                  key={activity.name}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addActivity(activity.name, activity.co2)}
                >
                  ➕ {activity.name} (+{activity.co2} kg CO₂)
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
