import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getAllUsers, setUserRole } from "../../services/ecoService";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const u = await getAllUsers();
      setUsers(u);
    } catch (e) {
      console.error(e);
      setError("Failed to load users");
    }
    setLoading(false);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await setUserRole(user.id, newRole);
      setActionMsg(`Updated ${user.email} to ${newRole}`);
      await fetchUsers();
    } catch (e) {
      console.error(e);
      setError("Unable to change role");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  // compute simple stats
  const totalUsers = users.length;
  const avgScore =
    users.reduce((sum, u) => sum + (u.ecoScore || 0), 0) / (totalUsers || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
      <div className="eco-container">
        <motion.h1
          className="eco-heading-2xl mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* stats row */}
        {!loading && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="eco-heading-lg">Total users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </Card>
            <Card>
              <p className="eco-heading-lg">Avg Eco Score</p>
              <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
            </Card>
          </div>
        )}

        {error && <p className="eco-alert-error mb-4">{error}</p>}
        {actionMsg && <p className="eco-alert-success mb-4">{actionMsg}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <Card>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2 capitalize">{u.role}</td>
                    <td className="px-4 py-2">
                      <Button
                        size="sm"
                        variant={u.role === "admin" ? "outline" : "primary"}
                        onClick={() => toggleRole(u)}
                      >
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        {/* future expansion area */}
        {!loading && (
          <div className="mt-8">
            <Card>
              <p className="eco-heading-lg mb-2">More tools coming soon</p>
              <p className="eco-text-muted">
                You can extend the admin dashboard with activity moderation,
                announcement broadcasting, or system settings.
              </p>
            </Card>
          </div>
        )}      </div>
    </div>
  );
}
