import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  updateUserProfileData,
  getUserBadges,
  BADGE_DEFINITIONS,
  getCarbonActivities,
  getWasteReports,
} from "../../services/ecoService";

export default function UserProfile() {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || currentUser?.email?.split("@")[0] || ""
  );
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [stats, setStats] = useState({
    ecoScore: 0,
    co2Saved: 0,
    wasteLogged: 0,
    activities: 0,
  });

  // Load badges on mount
  useEffect(() => {
    if (!currentUser) return;
    getUserBadges(currentUser.uid)
      .then((userBadges) => setBadges(userBadges))
      .catch((err) => console.error("failed to load badges", err))
      .finally(() => setLoadingBadges(false));
  }, [currentUser]);

  // Load stats
  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getCarbonActivities(currentUser.uid),
      getWasteReports(currentUser.uid),
    ])
      .then(([carbon, waste]) => {
        const co2Total = carbon.reduce((s, a) => s + (a.co2 || 0), 0);
        setStats({
          ecoScore: userProfile?.ecoScore || 0,
          co2Saved: co2Total,
          wasteLogged: waste.reduce((s, w) => s + (w.amount || 0), 0),
          activities: carbon.length,
        });
      })
      .catch((err) => console.error("failed to load stats", err));
  }, [currentUser, userProfile]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setEditing(false);
    try {
      // update auth display name
      if (displayName && displayName !== currentUser.displayName) {
        await updateProfile(displayName);
      }
      // update Firestore profile if needed
      await updateUserProfileData(currentUser.uid, { displayName });
      // optional: could refresh userProfile from context by forcing reload
    } catch (err) {
      console.error("failed to save profile", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
        <div className="eco-container max-w-2xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-6 mb-6">
              <img
                src={`https://i.pravatar.cc/150?u=${currentUser?.email}`}
                alt={currentUser?.email}
                className="w-24 h-24 rounded-full border-4 border-eco-500"
              />
              <div>
                <h1 className="eco-heading-2xl">{displayName || "User"}</h1>
                <p className="eco-text-muted">{currentUser?.email}</p>
                <div className="mt-2 flex gap-2">
                  {stats.ecoScore >= 500 && (
                    <span className="eco-badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      👑 Eco Champion
                    </span>
                  )}
                  {stats.ecoScore >= 100 && stats.ecoScore < 500 && (
                    <span className="eco-badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      🌱 Eco Warrior
                    </span>
                  )}
                  {stats.ecoScore < 100 && (
                    <span className="eco-badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      ⚡ Getting Started
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <p className="eco-text-muted text-sm">Eco Score</p>
              <p className="eco-heading-lg text-eco-600">{stats.ecoScore}</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">CO₂ Saved</p>
              <p className="eco-heading-lg">{stats.co2Saved.toFixed(1)} kg</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Waste Logged</p>
              <p className="eco-heading-lg">{stats.wasteLogged.toFixed(1)} kg</p>
            </Card>
            <Card>
              <p className="eco-text-muted text-sm">Activities</p>
              <p className="eco-heading-lg">{stats.activities}</p>
            </Card>
          </motion.div>

          {/* Bio Section */}
          <Card className="mb-6">
            <h2 className="eco-heading-lg mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="eco-input"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {displayName || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {currentUser?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Status
                </label>
                <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {userProfile?.role === "admin" ? "Admin" : "Regular User"}
                </p>
              </div>
            </div>

            {editing ? (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="mt-4"
              >
                Edit Profile
              </Button>
            )}
          </Card>

          {/* Achievements */}
          <Card className="mb-6">
            <h2 className="eco-heading-lg mb-4">🏆 Earned Badges</h2>
            {loadingBadges ? (
              <div className="flex justify-center py-10">
                <Loader size="md" />
              </div>
            ) : badges.length === 0 ? (
              <p className="eco-text-muted text-center py-8">
                No badges earned yet. Keep logging activities to unlock badges!
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-300 dark:border-amber-600"
                  >
                    <p className="text-4xl mb-2">{badge.icon}</p>
                    <p className="text-xs font-semibold">{badge.name}</p>
                    <p className="text-xs eco-text-muted mt-1">
                      {badge.unlockedAt?.toDate?.()?.toLocaleDateString?.() || "Earned"}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Show upcoming badges */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-eco-600 dark:text-eco-400 mb-3">
                🎯 Unlock more badges:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(BADGE_DEFINITIONS)
                  .filter((def) => !badges.find((b) => b.badgeId === def.id))
                  .slice(0, 4)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-50"
                    >
                      <p className="text-2xl mb-1">{badge.icon}</p>
                      <p className="text-xs font-semibold">{badge.name}</p>
                      <p className="text-xs eco-text-muted">{badge.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600">
            <h2 className="eco-heading-lg mb-4 text-red-600">Account Settings</h2>
            <div className="space-y-3">
              <Button variant="danger" className="w-full">
                Change Password
              </Button>
              <Button variant="danger" className="w-full">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
