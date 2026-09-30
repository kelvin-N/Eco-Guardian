import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const isAdmin = userProfile?.role === "admin";

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/carbon", label: "Carbon", icon: "🌱" },
    { path: "/waste", label: "Waste", icon: "♻️" },
    { path: "/community", label: "Community", icon: "🌍" },
    { path: "/analytics", label: "Analytics", icon: "📊" },
    { path: "/events", label: "Events", icon: "🎯" },
    { path: "/marketplace", label: "Marketplace", icon: "🛍️" },
    { path: "/education", label: "Education", icon: "📚" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    // add extra admin link at end if needed
    ...(isAdmin ? [{ path: "/admin/dashboard", label: "Admin", icon: "🛠️" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="eco-container">
        <div className="flex justify-between items-center h-16 transition-colors duration-200">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <span className="text-3xl">🌍</span>
            <div>
              <div className="eco-heading-sm text-eco-600 dark:text-eco-400">
                Eco
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Guardian
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <button
                    className={`px-3 py-2 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 ${
                      isActive(link.path)
                        ? "bg-eco-100 dark:bg-eco-900/30 text-eco-600 dark:text-eco-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* User Menu or Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <img
                    src={`https://i.pravatar.cc/150?u=${currentUser.email}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-eco-500"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentUser.email?.split("@")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 eco-card shadow-xl"
                  >
                    <div className="space-y-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {currentUser.email}
                          {userProfile?.role === "admin" && (
                            <span className="ml-2 text-xs text-eco-600 dark:text-eco-400 font-semibold">
                              (admin)
                            </span>
                          )}
                        </p>
                      </div>
                      <Link to="/profile">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                          👤 My Profile
                        </button>
                      </Link>
                      {userProfile?.role === "admin" && (
                        <Link to="/admin/dashboard">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                            🛠️ Admin Dashboard
                          </button>
                        </Link>
                      )}
                      <Link to="/settings">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                          ⚙️ Settings
                        </button>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-2"
          >
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    isActive(link.path)
                      ? "bg-eco-100 dark:bg-eco-900/30 text-eco-600 dark:text-eco-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </button>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
