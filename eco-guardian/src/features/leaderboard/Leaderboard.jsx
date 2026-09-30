import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const getMedalEmoji = (rank) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "⭐";
  }
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("global");
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!db) {
      setUsers([]);
      return;
    }

    const q = query(collection(db, "users"), orderBy("ecoScore", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const displayedUsers =
    view === "friends" && currentUser
      ? users.filter((u) => currentUser.friends?.includes(u.id))
      : users;

  const filteredUsers = displayedUsers.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRank = () => {
    if (!currentUser) return "-";
    const idx = users.findIndex((u) => u.id === currentUser.uid);
    return idx === -1 ? "-" : idx + 1;
  };

  const currentUserRank = getRank();
  const getCurrentUserStats = () => {
    const user = users.find((u) => u.id === currentUser?.uid);
    return {
      rank: currentUserRank,
      score: user?.ecoScore || 0,
    };
  };

  const stats = getCurrentUserStats();

  return (
    <Card elevated className="mt-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🏆</span>
          <h2 className="eco-heading-md">Global Leaderboard</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView("global")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === "global"
                ? "bg-eco-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setView("friends")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === "friends"
                ? "bg-eco-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            👥 Friends
          </button>
        </div>
      </div>

      {/* Your Rank Card */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-eco-100 to-blue-100 dark:from-eco-900/30 dark:to-blue-900/30 rounded-xl border-l-4 border-eco-500"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="eco-text-subtle text-sm mb-1">Your Rank</p>
              <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                #{stats.rank}
              </p>
            </div>
            <div>
              <p className="eco-text-subtle text-sm mb-1">Your Score</p>
              <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                {stats.score}
              </p>
            </div>
            <div>
              <p className="eco-text-subtle text-sm mb-1">Next Milestone</p>
              <p className="eco-heading-lg text-eco-600 dark:text-eco-400">
                {stats.score < 500 ? `${500 - stats.score} pts` : "🎉"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="eco-input w-full"
        />
      </div>

      {/* Leaderboard List */}
      <motion.div layout className="space-y-2">
        <AnimatePresence>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const actualRank = users.findIndex((u) => u.id === user.id) + 1;
              const isCurrentUser = user.id === currentUser?.uid;

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex items-center justify-between p-4 rounded-lg transition ${
                    isCurrentUser
                      ? "bg-eco-50 dark:bg-eco-900/20 border-2 border-eco-500"
                      : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {/* Rank and User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-eco-400 to-eco-600 rounded-full text-white font-bold">
                      <span className="text-lg">{getMedalEmoji(actualRank)}</span>
                    </div>

                    <img
                      src={
                        user.photoURL ||
                        `https://i.pravatar.cc/150?u=${user.email}`
                      }
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-eco-500"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs eco-text-subtle">
                        {user.email && `@${user.email.split("@")[1]}`}
                      </p>
                    </div>

                    {/* Badges */}
                    {user.badges && user.badges.length > 0 && (
                      <div className="flex gap-1">
                        {user.badges.slice(0, 3).map((badge, i) => (
                          <span key={i} className="text-lg" title={badge}>
                            🏅
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <motion.div
                    className={`text-right ${
                      isCurrentUser ? "pr-2" : ""
                    }`}
                    animate={{ scale: isCurrentUser ? [1, 1.1, 1] : 1 }}
                    transition={{
                      duration: 2,
                      repeat: isCurrentUser ? Infinity : 0,
                    }}
                  >
                    <p className="text-2xl font-bold text-eco-600 dark:text-eco-400">
                      {user.ecoScore}
                    </p>
                    <p className="text-xs eco-text-subtle">points</p>
                  </motion.div>

                  {/* Actions */}
                  {isCurrentUser && (
                    <div className="ml-2">
                      <span className="eco-badge-success text-xs">YOU</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🔍</p>
              <p className="eco-text-muted">No users found matching your search</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-6 eco-divider"></div>
      <div className="mt-4 text-center eco-text-subtle text-sm">
        <p>Scores update in real-time • Last updated: just now</p>
      </div>
    </Card>
  );
}
