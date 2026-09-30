import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    weeklyReport: true,
    locationSharing: false,
    darkMode: true,
    ecoTips: true,
    challengeAlerts: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
        <div className="eco-container max-w-3xl">
          <motion.div
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
          </motion.div>

          <div className="space-y-6">
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
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings[key] ? "bg-eco-500" : "bg-gray-300 dark:bg-gray-700"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${settings[key] ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="eco-heading-lg mb-4">Privacy & Devices</h2>
              <div className="space-y-4">
                {[
                  ["locationSharing", "Allow location-based eco reports"],
                  ["darkMode", "Enable dark mode by default"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-sm eco-text-muted">Adjust the experience to match your preferences.</p>
                    </div>
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => toggleSetting(key)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings[key] ? "bg-eco-500" : "bg-gray-300 dark:bg-gray-700"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${settings[key] ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="eco-heading-lg mb-4">Sustainability Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-eco-50 dark:bg-eco-900/20 p-4">
                  <p className="text-sm eco-text-muted">Monthly CO₂ target</p>
                  <p className="mt-2 text-2xl font-bold text-eco-600 dark:text-eco-400">50 kg</p>
                </div>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm eco-text-muted">Waste reduction goal</p>
                  <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">25 kg</p>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Save Settings</Button>
              <Button variant="outline">Reset</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
