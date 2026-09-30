import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ActivityBreakdown({ carbonActivities }) {
  // group by activity name
  const getBreakdown = () => {
    const breakdown = {};
    carbonActivities.forEach((activity) => {
      const name = activity.activity || "Unknown";
      breakdown[name] = (breakdown[name] || 0) + (activity.co2 || 0);
    });

    return Object.entries(breakdown)
      .map(([name, co2]) => ({
        name,
        value: parseFloat(co2.toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  };

  const data = getBreakdown();
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value}kg`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} kg CO₂`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
