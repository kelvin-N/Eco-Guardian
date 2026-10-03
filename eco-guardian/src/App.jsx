import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Login from "./features/auth/Login";
import SignUp from "./features/auth/SignUp";
import Dashboard from "./features/dashboard/Dashboard";
import Events from "./features/events/Events";
import Marketplace from "./features/marketplace/Marketplace";
import EducationHub from "./features/education/EducationHub";
import Leaderboard from "./features/leaderboard/Leaderboard";
import AdminRoute from "./components/AdminRoute";
import AccessDenied from "./features/auth/AccessDenied";
import AdminDashboard from "./features/admin/AdminDashboard";
import CarbonTracker from "./features/carbon/CarbonTracker";
import WasteReporting from "./features/waste/WasteReporting";
import CommunityLeaderboard from "./features/community/CommunityLeaderboard";
import EnvironmentalAnalytics from "./features/analytics/EnvironmentalAnalytics";
import UserProfile from "./features/profile/UserProfile";
import Settings from "./features/profile/Settings";
import { useAuth } from "./context/AuthContext";

// -------------------------------
// Protected Route
// -------------------------------
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌍</div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading Eco-Guardian...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// -------------------------------
// App
// -------------------------------
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>

            {/* AUTH */}
            <Route
              path="/login"
              element={
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login />
                </motion.div>
              }
            />

            <Route
              path="/signup"
              element={
                <motion.div
                  key="signup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignUp />
                </motion.div>
              }
            />

            {/* PROTECTED USER ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/education"
              element={
                <ProtectedRoute>
                  <EducationHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/carbon"
              element={
                <ProtectedRoute>
                  <CarbonTracker />
                </ProtectedRoute>
              }
            />

            <Route
              path="/waste"
              element={
                <ProtectedRoute>
                  <WasteReporting />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityLeaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <EnvironmentalAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            {/* ACCESS DENIED */}
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}