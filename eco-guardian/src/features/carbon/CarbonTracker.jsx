import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  addCarbonActivity,
  checkAndAwardBadges,
  getCarbonActivities,
} from "../../services/ecoService";

const QUICK_ACTIONS = [
  "Walked or cycled instead of driving",
  "Used public transportation",
  "Shared a ride",
  "Chose a lower-carbon meal",
  "Reduced home energy use",
  "Other",
];
const EMPTY_FORM = { activity: "", co2: "" };

function activityDate(createdAt) {
  const date = createdAt?.toDate
    ? createdAt.toDate()
    : createdAt
      ? new Date(createdAt)
      : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString()
    : "Date unavailable";
}

export default function CarbonTracker() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadActivities = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setActivities(await getCarbonActivities(currentUser.uid));
      setError("");
    } catch (loadError) {
      console.error("Failed to load carbon activities:", loadError);
      setError(loadError.message || "Carbon activity could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const stats = useMemo(() => {
    const currentMonth = new Date();
    const thisMonth = activities.filter((activity) => {
      const date = activity.createdAt?.toDate
        ? activity.createdAt.toDate()
        : activity.createdAt
          ? new Date(activity.createdAt)
          : null;
      return date
        && date.getFullYear() === currentMonth.getFullYear()
        && date.getMonth() === currentMonth.getMonth();
    });
    return {
      totalSaved: activities.reduce((total, activity) => total + (activity.co2 || 0), 0),
      monthSaved: thisMonth.reduce((total, activity) => total + (activity.co2 || 0), 0),
      count: activities.length,
    };
  }, [activities]);

  const logActivity = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid) {
      setError("Sign in to save carbon activity.");
      return;
    }

    const activity = form.activity.trim();
    const co2 = Number(form.co2);
    if (activity.length < 3 || activity.length > 160) {
      setError("Describe the action using 3 to 160 characters.");
      return;
    }
    if (!Number.isFinite(co2) || co2 <= 0 || co2 > 1000) {
      setError("Enter an estimated amount greater than 0 and no more than 1,000 kg CO₂.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await addCarbonActivity(currentUser.uid, activity, co2);
      await loadActivities();
      setForm(EMPTY_FORM);
      setMessage("Your carbon-saving action was saved.");
      try {
        await checkAndAwardBadges(currentUser.uid);
      } catch (badgeError) {
        console.error("Carbon action was saved, but badge status could not be refreshed:", badgeError);
      }
    } catch (saveError) {
      console.error("Failed to save carbon activity:", saveError);
      setError(saveError.message || "Your carbon-saving action could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="eco-heading-2xl mb-2">🌱 Carbon Impact Tracker</h1>
            <p className="eco-text-muted mb-6">
              Record actions and your estimated CO₂ savings to build a personal impact history.
            </p>
            <p className="eco-alert-warning mb-6">
              This is a self-reported savings tracker, not a complete household carbon-footprint calculator.
              Use a consistent estimate source; amounts are not independently verified.
            </p>

            {error && <p className="eco-alert-error mb-5" role="alert">{error}</p>}
            {message && <p className="eco-alert-success mb-5" role="status">{message}</p>}

            {loading ? (
              <div className="flex justify-center py-20"><Loader size="lg" /></div>
            ) : (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <Card>
                    <p className="eco-text-muted text-sm">Estimated CO₂ saved (all time)</p>
                    <p className="eco-heading-lg text-eco-600">{stats.totalSaved.toFixed(1)} kg</p>
                  </Card>
                  <Card>
                    <p className="eco-text-muted text-sm">Estimated CO₂ saved this month</p>
                    <p className="eco-heading-lg text-eco-600">{stats.monthSaved.toFixed(1)} kg</p>
                  </Card>
                  <Card>
                    <p className="eco-text-muted text-sm">Actions logged</p>
                    <p className="eco-heading-lg">{stats.count}</p>
                  </Card>
                </div>

                <Card className="mb-6">
                  <h2 className="eco-heading-lg mb-2">Log a carbon-saving action</h2>
                  <p className="eco-text-muted mb-5">
                    Choose an example or describe your own action, then enter the estimated kilograms of CO₂ avoided.
                    The app does not guess a savings amount for you.
                  </p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setForm((previous) => ({ ...previous, activity: action }))}
                        className="rounded-full border border-eco-300 px-3 py-2 text-sm text-eco-800 transition hover:bg-eco-50 dark:border-eco-700 dark:text-eco-200 dark:hover:bg-eco-900/30"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={logActivity} className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_auto] md:items-end">
                    <label className="block text-sm font-medium">
                      Action
                      <input
                        required
                        minLength={3}
                        maxLength={160}
                        value={form.activity}
                        onChange={(event) => setForm({ ...form, activity: event.target.value })}
                        className="eco-input mt-2"
                        placeholder="Describe what you did"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Estimated CO₂ saved (kg)
                      <input
                        required
                        type="number"
                        min="0.01"
                        max="1000"
                        step="0.01"
                        value={form.co2}
                        onChange={(event) => setForm({ ...form, co2: event.target.value })}
                        className="eco-input mt-2"
                        placeholder="e.g. 0.8"
                      />
                    </label>
                    <Button type="submit" disabled={saving} loading={saving}>
                      {saving ? "Saving…" : "Save action"}
                    </Button>
                  </form>
                  <p className="mt-4 text-xs eco-text-subtle">
                    These self-reported entries do not increase your Eco Score. This helps keep leaderboard points separate from unverified estimates.
                  </p>
                </Card>

                <Card>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="eco-heading-lg">Your activity history</h2>
                    <Button type="button" variant="outline" size="sm" onClick={loadActivities} disabled={loading}>
                      Refresh
                    </Button>
                  </div>
                  {activities.length === 0 ? (
                    <p className="eco-text-muted">
                      No carbon-saving actions yet. Record an action above to start your history.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {activities.map((activity) => (
                        <li
                          key={activity.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                        >
                          <div>
                            <p className="font-medium">{activity.activity || "Carbon-saving action"}</p>
                            <p className="text-xs eco-text-muted">{activityDate(activity.createdAt)}</p>
                          </div>
                          <p className="font-semibold text-eco-700 dark:text-eco-300">
                            {Number(activity.co2 || 0).toFixed(2)} kg CO₂ saved
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </>
            )}
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
