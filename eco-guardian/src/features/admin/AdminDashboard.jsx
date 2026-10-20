import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getAllUsers, setUserRole } from "../../services/ecoService";
import { getOrganizationInquiries } from "../../services/organizationService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizationInquiries, setOrganizationInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const u = await getAllUsers();
      setUsers(u);
    } catch (e) {
      console.error(e);
      setError("Failed to load users");
    }
    try {
      setOrganizationInquiries(await getOrganizationInquiries());
    } catch (e) {
      console.error("Failed to load organization inquiries:", e);
      setError((previous) => previous
        ? `${previous}. Organization inquiries could not be loaded.`
        : "Organization inquiries could not be loaded.");
    }
    setLoading(false);
  }, []);

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
  }, [fetchUsers]);

  // compute simple stats
  const totalUsers = users.length;
  const avgScore =
    users.reduce((sum, u) => sum + (u.ecoScore || 0), 0) / (totalUsers || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8">
      <div className="eco-container">
        <Motion.h1
          className="eco-heading-2xl mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </Motion.h1>
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/reports")}>
            Review incident reports
          </Button>
        </div>

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
          <>
            <Card className="mb-8">
              <h2 className="eco-heading-lg mb-4">
                Organization pilot inquiries ({organizationInquiries.length})
              </h2>
              {organizationInquiries.length === 0 ? (
                <p className="eco-text-muted">No organization inquiries yet.</p>
              ) : (
                <div className="space-y-4">
                  {organizationInquiries.map((inquiry) => (
                    <article key={inquiry.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{inquiry.organizationName}</h3>
                          <p className="text-sm eco-text-muted">
                            {inquiry.organizationType} · {inquiry.contactName}
                          </p>
                          <a
                            href={`mailto:${encodeURIComponent(inquiry.email)}`}
                            className="text-sm text-eco-700 underline dark:text-eco-300"
                          >
                            {inquiry.email}
                          </a>
                        </div>
                        <span className="text-xs eco-text-subtle">
                          {inquiry.createdAt?.toDate?.()?.toLocaleString?.() || "Recently submitted"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm">{inquiry.message}</p>
                      <p className="mt-2 text-xs eco-text-subtle">
                        Interested in: {inquiry.interests?.join(", ")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="eco-heading-lg mb-4">User accounts</h2>
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
          </>
        )}
      </div>
    </div>
  );
}
