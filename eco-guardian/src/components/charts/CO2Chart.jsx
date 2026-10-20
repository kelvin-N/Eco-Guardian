import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CO2Chart({ carbonActivities }) {
  const getDailyData = () => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayKey = d.toLocaleDateString();
      days[dayKey] = 0;
    }

    carbonActivities.forEach((activity) => {
      const actDate = activity.createdAt?.toDate?.()
        || (activity.createdAt ? new Date(activity.createdAt) : null);
      if (!actDate || Number.isNaN(actDate.getTime())) return;
      const diff = Math.floor((now - actDate) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 6) {
        const dayKey = actDate.toLocaleDateString();
        if (dayKey in days) days[dayKey] += Number(activity.co2) || 0;
      }
    });

    return Object.entries(days).map(([day, co2]) => ({
      day,
      co2: parseFloat(co2.toFixed(1)),
    }));
  };

  const data = getDailyData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="day" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #4b5563",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value} kg CO₂`, "Estimated savings"]}
        />
        <Line
          type="monotone"
          dataKey="co2"
          name="Estimated CO₂ savings"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
