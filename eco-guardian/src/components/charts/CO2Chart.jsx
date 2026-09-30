import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CO2Chart({ carbonActivities }) {
  // transform carbonActivities into weekly data
  const getWeeklyData = () => {
    const weeks = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const weekKey = `Week ${i + 1}`;
      weeks[weekKey] = 0;
    }

    carbonActivities.forEach((activity) => {
      const actDate = activity.createdAt?.toDate?.() || new Date();
      const diff = Math.floor((now - actDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diff / 7);
      if (weekIndex >= 0 && weekIndex <= 6) {
        const weekKey = `Week ${7 - weekIndex}`;
        weeks[weekKey] += activity.co2 || 0;
      }
    });

    return Object.entries(weeks).map(([week, co2]) => ({
      week,
      co2: parseFloat(co2.toFixed(1)),
    }));
  };

  const data = getWeeklyData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #4b5563",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value} kg CO₂`, "Saved"]}
        />
        <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
