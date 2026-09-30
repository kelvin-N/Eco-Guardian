import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function WasteBreakdown({ wasteReports }) {
  // group by waste type
  const getWasteData = () => {
    const breakdown = {};
    wasteReports.forEach((report) => {
      const type = report.type || "Unknown";
      breakdown[type] = (breakdown[type] || 0) + (report.amount || 0);
    });

    return Object.entries(breakdown)
      .map(([type, amount]) => ({
        type,
        amount: parseFloat(amount.toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const data = getWasteData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="type" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #4b5563",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value} kg`, "Waste"]}
        />
        <Bar dataKey="amount" fill="#10b981" radius={8} />
      </BarChart>
    </ResponsiveContainer>
  );
}
