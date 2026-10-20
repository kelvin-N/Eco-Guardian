import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { getCarbonActivities, getWasteReports } from "../../services/ecoService";
import {
  DEFAULT_GOALS,
  DEFAULT_SETTINGS,
  getMonthlyTotal,
  getPreferencesKey,
  loadPreferences,
} from "../goals/goalUtils";

function GoalProgress({ label, unit, value, target, color }) {
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const reached = target > 0 && value >= target;

  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className={`text-sm font-semibold ${color}`}>
          {value.toFixed(1)} / {target.toFixed(1)} {unit}
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(value, target)}
      >
        <div
          className={`h-full rounded-full bg-current transition-all ${color}`}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-sm eco-text-muted" aria-live="polite">
        {reached
          ? "Monthly goal reached!"
          : `${Math.max(target - value, 0).toFixed(1)} ${unit} to go this month`}
      </p>
    </div>
  );
}

export default function Settings() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const { isDark, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState(() =>
    loadPreferences(userId || "guest")
  );
  const [monthlyTotals, setMonthlyTotals] = useState({ carbon: 0, waste: 0 });
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreferences(loadPreferences(userId || "guest"));
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setGoalsLoading(false);
      return undefined;
    }

    setGoalsLoading(true);
    setError("");
    setMonthlyTotals({ carbon: 0, waste: 0 });
    Promise.all([
      getCarbonActivities(userId),
      getWasteReports(userId),
    ])
      .then(([carbonActivities, wasteReports]) => {
        if (cancelled) return;
        setMonthlyTotals({
          carbon: getMonthlyTotal(carbonActivities, "co2"),
          waste: getMonthlyTotal(wasteReports, "amount"),
        });
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("Failed to load monthly goal progress:", loadError);
        setError("Unable to load this month's progress. Please try again later.");
      })
      .finally(() => {
        if (!cancelled) setGoalsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleSetting = (key) => {
    setPreferences((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        [key]: !previous.settings[key],
      },
    }));
  };

  const updateGoal = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      goals: { ...previous.goals, [key]: value },
    }));
  };

  const savePreferences = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const carbonTarget = Number(preferences.goals.carbon);
    const wasteTarget = Number(preferences.goals.waste);
    if (
      !Number.isFinite(carbonTarget) ||
      carbonTarget <= 0 ||
      !Number.isFinite(wasteTarget) ||
      wasteTarget <= 0
    ) {
      setError("Enter a monthly target greater than zero for both goals.");
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem(
        getPreferencesKey(userId || "guest"),
        JSON.stringify(preferences)
      );
      setMessage("Preferences and monthly goals saved on this device.");
    } catch (saveError) {
      console.error("Failed to save preferences:", saveError);
      setError("Unable to save preferences. Check your browser storage and try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = () => {
    setError("");
    setMessage("");
    setPreferences({ settings: DEFAULT_SETTINGS, goals: DEFAULT_GOALS });
    try {
      localStorage.removeItem(getPreferencesKey(userId || "guest"));
      setMessage("Preferences reset to their defaults.");
    } catch (resetError) {
      console.error("Failed to reset preferences:", resetError);
      setError("Unable to reset preferences. Check your browser storage and try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
        <div className="eco-container max-w-3xl">
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-eco-600 dark:text-eco-400">
              Preferences
            </p>
            <h1 className="eco-heading-xl mt-2">Settings</h1>
            <p className="eco-text-muted mt-2">
              Manage your eco profile, updates, and app experience.
            </p>
          </Motion.div>

          <form onSubmit={savePreferences} className="space-y-6">
            <Card>
              <h2 className="eco-heading-lg mb-4">Notifications</h2>
              <div className="space-y-4">
                {[
                  ["notifications", "Push notifications"],
                  ["weeklyReport", "Weekly progress report"],
                  ["challengeAlerts", "Daily challenge reminders"],
                  ["ecoTips", "Eco-friendly tips"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-sm eco-text-muted">Stay motivated and informed.</p>
                    </div>
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => toggleSetting(key)}
                      aria-pressed={preferences.settings[key]}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${preferences.settings[key] ? "bg-eco-500" : "bg-gray-300 dark:bg-gray-700"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${preferences.settings[key] ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="eco-heading-lg mb-4">Privacy & Devices</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Allow location-based eco reports</p>
                    <p className="text-sm eco-text-muted">Adjust the experience to match your preferences.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Allow location-based eco reports"
                    onClick={() => toggleSetting("locationSharing")}
                    aria-pressed={preferences.settings.locationSharing}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${preferences.settings.locationSharing ? "bg-eco-500" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${preferences.settings.locationSharing ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark mode</p>
                    <p className="text-sm eco-text-muted">Use a darker appearance throughout the app.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dark mode"
                    aria-pressed={isDark}
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${isDark ? "bg-eco-500" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isDark ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="eco-heading-lg mb-2">Monthly Sustainability Goals</h2>
              <p className="eco-text-muted mb-5">
                Progress is calculated from carbon savings and waste reports logged this calendar month.
              </p>
              <div className="space-y-5">
                <GoalProgress
                  label="Carbon saved"
                  unit="kg CO₂"
                  value={monthlyTotals.carbon}
                  target={Number(preferences.goals.carbon) || 0}
                  color="text-eco-600 dark:text-eco-400"
                />
                <GoalProgress
                  label="Waste reported"
                  unit="kg"
                  value={monthlyTotals.waste}
                  target={Number(preferences.goals.waste) || 0}
                  color="text-blue-600 dark:text-blue-400"
                />
              </div>
              {goalsLoading && (
                <p className="mt-4 text-sm eco-text-muted" role="status">
                  Loading this month's progress...
                </p>
              )}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Monthly carbon goal (kg CO₂)
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={preferences.goals.carbon}
                    onChange={(event) => updateGoal("carbon", event.target.value)}
                    className="eco-input mt-2"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Monthly waste goal (kg)
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={preferences.goals.waste}
                    onChange={(event) => updateGoal("waste", event.target.value)}
                    className="eco-input mt-2"
                  />
                </label>
              </div>
              <p className="mt-3 text-xs eco-text-muted">
                Goals and preferences are saved in this browser and are specific to your signed-in account on this device.
              </p>
              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="mt-4 text-sm text-eco-700 dark:text-eco-300" role="status">
                  {message}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Settings & Goals"}
                </Button>
                <Button variant="outline" type="button" onClick={resetPreferences}>
                  Reset Preferences
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
