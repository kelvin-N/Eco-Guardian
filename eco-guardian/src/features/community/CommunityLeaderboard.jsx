import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getLeaderboard } from "../../services/ecoService";

export default function CommunityLeaderboard() {
  const { currentUser } = useAuth();
  const [view, setView] = useState("global");

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(20)
      .then((users) => {
        if (cancelled) return;
        const formatted = users.map((u, idx) => ({
          id: u.id,
          rank: idx + 1,
          name: u.displayName || "Community member",
          eco: u.ecoScore || 0,
          badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
        }));
        setLeaderboard(formatted);
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("Failed to load community leaderboard:", loadError);
        setError("Leaderboard data could not be loaded. Please try again later.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayList =
    view === "global"
      ? leaderboard
      : leaderboard.filter((u) => u.id === currentUser?.uid);
  const currentRank = leaderboard.find((user) => user.id === currentUser?.uid);
  const userAhead = currentRank
    ? leaderboard.find((user) => user.rank === currentRank.rank - 1)
    : null;

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
            🌍 Community Leaderboard
          </Motion.h1>
          <p className="eco-text-muted mb-6">
            See how you compare with other eco-warriors worldwide.
          </p>

          {/* View Toggle */}
          <div className="mb-6 flex gap-2">
            <Button
              variant={view === "global" ? "primary" : "outline"}
              onClick={() => setView("global")}
            >
              Global Rankings
            </Button>
            <Button
              variant={view === "friends" ? "primary" : "outline"}
              onClick={() => setView("friends")}
            >
              My Rank
            </Button>
          </div>
          {loading && (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          )}
          {!loading && leaderboard.length === 0 && (
            <p className="eco-text-muted text-center py-10">
              No leaderboard data available yet.
            </p>
          )}
          {error && (
            <p className="eco-alert-error mb-6" role="alert">{error}</p>
          )}

          {/* Leaderboard Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Rank</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Eco Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((user, idx) => (
                    <Motion.tr
                      key={user.id}
                      className={`border-t ${
                        user.id === currentUser?.uid
                          ? "bg-eco-100 dark:bg-eco-900/20"
                          : ""
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-2xl">{user.badge || "🏅"}</span>
                        <span className="ml-2 font-semibold">#{user.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-eco-100 text-xs font-semibold text-eco-700 dark:bg-eco-900/30 dark:text-eco-300"
                          >
                            {user.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-eco-600">
                        {user.eco} pts
                      </td>
                    </Motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Next Tier */}
          <Card className="mt-6">
            <h2 className="eco-heading-lg mb-2">Next Milestone</h2>
            <p className="eco-text-muted mb-4">
              {!currentRank
                ? "Log an eco activity to appear on the rankings."
                : currentRank.rank === 1
                  ? "You are at the top of the rankings. Keep it up!"
                  : userAhead
                    ? `${userAhead.eco - currentRank.eco + 1} more points to move up one place.`
                    : "Keep logging eco activities to improve your rank."}
            </p>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
