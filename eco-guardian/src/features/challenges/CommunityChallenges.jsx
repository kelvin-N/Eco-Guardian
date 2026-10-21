import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import {
  getCarbonActivities,
  getUserActivities,
  getWasteReports,
} from "../../services/ecoService";
import {
  getCommunityChallengeMembers,
  joinCommunityChallenge,
  leaveCommunityChallenge,
} from "../../services/communityService";
import {
  countChallengeProgress,
  getCurrentCommunityChallenges,
} from "./challengeDefinitions";

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function CommunityChallenges() {
  const { currentUser, userProfile } = useAuth();
  const challenges = useMemo(() => getCurrentCommunityChallenges(), []);
  const [activities, setActivities] = useState([]);
  const [carbon, setCarbon] = useState([]);
  const [waste, setWaste] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyChallengeId, setBusyChallengeId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadChallenges = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextActivities, nextCarbon, nextWaste, ...memberLists] = await Promise.all([
        getUserActivities(currentUser.uid),
        getCarbonActivities(currentUser.uid),
        getWasteReports(currentUser.uid),
        ...challenges.map((challenge) => (
          getCommunityChallengeMembers(challenge.id, challenge.periodStart)
        )),
      ]);
      setActivities(nextActivities);
      setCarbon(nextCarbon);
      setWaste(nextWaste);
      setMembers(Object.fromEntries(
        challenges.map((challenge, index) => [challenge.id, memberLists[index]])
      ));
      setError("");
    } catch (loadError) {
      console.error("Failed to load community challenges:", loadError);
      setError(loadError.message || "Challenges could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [challenges, currentUser?.uid]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleMembership = async (challenge, isJoined) => {
    if (!currentUser?.uid) return;
    setBusyChallengeId(challenge.id);
    setError("");
    setMessage("");
    const displayName = (
      userProfile?.displayName
      || currentUser.displayName
      || currentUser.email?.split("@")[0]
      || "Community member"
    ).trim() || "Community member";

    try {
      if (isJoined) {
        await leaveCommunityChallenge(
          currentUser.uid,
          challenge.id,
          challenge.periodStart
        );
        setMessage(`You left “${challenge.title}.”`);
      } else {
        await joinCommunityChallenge(
          currentUser.uid,
          displayName,
          challenge.id,
          challenge.periodStart
        );
        setMessage(`You joined “${challenge.title}.”`);
      }
      await loadChallenges();
    } catch (membershipError) {
      console.error("Failed to update challenge membership:", membershipError);
      setError(membershipError.message || "Your challenge membership could not be updated.");
    } finally {
      setBusyChallengeId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container max-w-5xl">
          <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="eco-heading-xl mb-2">🌍 Community Challenges</h1>
            <p className="eco-text-muted mb-6">
              Join this week’s shared sustainability goals. Progress is counted from your own logged activities.
            </p>
            <div className="eco-alert-warning mb-6">
              Joining shares your display name and app account identifier with signed-in community members so participation can be counted.
              Your progress is private to you. Carbon entries count as actions only; savings estimates are not verified.
            </div>

            {error && <p className="eco-alert-error mb-5" role="alert">{error}</p>}
            {message && <p className="eco-alert-success mb-5" role="status">{message}</p>}

            {loading ? (
              <div className="flex justify-center py-20"><Loader size="lg" /></div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {challenges.map((challenge) => {
                  const joinedMembers = members[challenge.id] || [];
                  const isJoined = joinedMembers.some(
                    (member) => member.uid === currentUser?.uid
                  );
                  const progress = countChallengeProgress(
                    challenge,
                    activities,
                    carbon,
                    waste
                  );
                  const percentage = Math.min(
                    100,
                    Math.round((progress / challenge.goal) * 100)
                  );
                  const completed = progress >= challenge.goal;
                  const endDate = new Date(challenge.end);
                  endDate.setUTCDate(endDate.getUTCDate() - 1);

                  return (
                    <Card key={challenge.id} className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-3xl" aria-hidden="true">{challenge.icon}</span>
                          <h2 className="eco-heading-md mt-2">{challenge.title}</h2>
                        </div>
                        <span className="shrink-0 rounded-full bg-eco-100 px-3 py-1 text-xs font-semibold text-eco-800 dark:bg-eco-900/30 dark:text-eco-200">
                          Weekly
                        </span>
                      </div>
                      <p className="eco-text-muted mt-3">{challenge.description}</p>
                      <p className="mt-3 text-sm font-medium">
                        {formatDate(challenge.start)} – {formatDate(endDate)}
                      </p>
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Your progress</span>
                          <span className="font-semibold">
                            {Math.min(progress, challenge.goal)} / {challenge.goal} {challenge.unit}
                          </span>
                        </div>
                        <div
                          className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                          role="progressbar"
                          aria-label={`${challenge.title} progress`}
                          aria-valuemin={0}
                          aria-valuemax={challenge.goal}
                          aria-valuenow={Math.min(progress, challenge.goal)}
                        >
                          <div
                            className="h-full rounded-full bg-eco-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {completed && (
                          <p className="mt-2 text-sm font-semibold text-eco-700 dark:text-eco-300">
                            Challenge goal reached — nice work!
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <p className="text-sm eco-text-muted">
                          {joinedMembers.length} {joinedMembers.length === 1 ? "person" : "people"} joined
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant={isJoined ? "outline" : "primary"}
                          disabled={busyChallengeId === challenge.id}
                          loading={busyChallengeId === challenge.id}
                          onClick={() => handleMembership(challenge, isJoined)}
                        >
                          {busyChallengeId === challenge.id
                            ? "Updating..."
                            : isJoined
                              ? "Leave challenge"
                              : "Join challenge"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
