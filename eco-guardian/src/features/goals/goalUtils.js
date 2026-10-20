export const DEFAULT_SETTINGS = {
  notifications: true,
  weeklyReport: true,
  locationSharing: false,
  ecoTips: true,
  challengeAlerts: true,
};

export const DEFAULT_GOALS = { carbon: "50", waste: "25" };

export function getPreferencesKey(uid) {
  return `ecoGuardianPreferences:${uid}`;
}

export function loadPreferences(uid) {
  try {
    const saved = localStorage.getItem(getPreferencesKey(uid));
    if (!saved) return { settings: DEFAULT_SETTINGS, goals: DEFAULT_GOALS };

    const preferences = JSON.parse(saved);
    if (!preferences || typeof preferences !== "object") {
      return { settings: DEFAULT_SETTINGS, goals: DEFAULT_GOALS };
    }

    const goals = preferences.goals || {};
    const carbonTarget = Number(goals.carbon);
    const wasteTarget = Number(goals.waste);

    return {
      settings: { ...DEFAULT_SETTINGS, ...preferences.settings },
      goals: {
        carbon: String(
          Number.isFinite(carbonTarget) && carbonTarget > 0
            ? carbonTarget
            : DEFAULT_GOALS.carbon
        ),
        waste: String(
          Number.isFinite(wasteTarget) && wasteTarget > 0
            ? wasteTarget
            : DEFAULT_GOALS.waste
        ),
      },
    };
  } catch (error) {
    console.error("Failed to load saved preferences:", error);
    return { settings: DEFAULT_SETTINGS, goals: DEFAULT_GOALS };
  }
}

export function isInCurrentMonth(timestamp) {
  const date = timestamp?.toDate
    ? timestamp.toDate()
    : timestamp instanceof Date
      ? timestamp
      : timestamp
        ? new Date(timestamp)
        : null;

  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function getMonthlyTotal(records, field) {
  return records.reduce((total, record) => {
    if (!isInCurrentMonth(record.createdAt)) return total;
    const value = Number(record[field]);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}
