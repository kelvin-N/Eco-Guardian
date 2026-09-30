import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, userProfile, loading } = useAuth();

  // while auth/profile is loading, don't render anything (could show spinner)
  if (loading) return null;

  // check role from profile or merged user object
  const role = userProfile?.role || user?.role;
  return role === "admin" ? children : <Navigate to="/login" replace />;
}
