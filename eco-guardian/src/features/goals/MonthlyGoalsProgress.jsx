import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { getCarbonActivities, getWasteReports } from "../../services/ecoService";
import { getMonthlyTotal, loadPreferences } from "./goalUtils";

function GoalBar({ label, unit, value, target, color }) {
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm eco-text-muted">
          {value.toFixed(1)} / {target.toFixed(1)} {unit}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(value, target)}
      >
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function MonthlyGoalsProgress({ userId }) {
  const [goals] = useState(() => loadPreferences(userId).goals);
  const [totals, setTotals] = useState({ carbon: 0, waste: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCarbonActivities(userId), getWasteReports(userId)])
      .then(([carbonActivities, wasteReports]) => {
        if (cancelled) return;
        setTotals({
          carbon: getMonthlyTotal(carbonActivities, "co2"),
          waste: getMonthlyTotal(wasteReports, "amount"),
        });
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("Failed to load monthly goal progress:", loadError);
        setError("Monthly goal progress could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Card elevated>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🎯</span>
          <h3 className="eco-heading-sm">Monthly Goals</h3>
        </div>
        <Link
          to="/settings"
          className="text-sm font-medium text-eco-700 hover:underline dark:text-eco-300"
        >
          Edit goals
        </Link>
      </div>
      <p className="mb-4 text-sm eco-text-muted">
        Progress from activities logged this calendar month.
      </p>
      <div className="space-y-5">
        <GoalBar
          label="Carbon saved"
          unit="kg CO₂"
          value={totals.carbon}
          target={Number(goals.carbon)}
          color="bg-eco-500"
        />
        <GoalBar
          label="Waste reported"
          unit="kg"
          value={totals.waste}
          target={Number(goals.waste)}
          color="bg-blue-500"
        />
      </div>
      {loading && (
        <p className="mt-4 text-sm eco-text-muted" role="status">
          Loading goal progress...
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
