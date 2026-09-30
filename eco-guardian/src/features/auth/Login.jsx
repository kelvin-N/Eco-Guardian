import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login");
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await login("demo@ecoguidance.com", "demo123");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login with demo account");
    }

    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_#f0fdf4_0%,_#ffffff_40%,_#eff6ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_#020817_0%,_#0f172a_40%,_#111827_100%)] px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-center mb-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 shadow-lg ring-1 ring-eco-100 dark:bg-slate-900/80 dark:ring-eco-900/60 text-5xl backdrop-blur-sm">
              🌍
            </div>
          </div>
          <h1 className="eco-heading-lg mb-2">Welcome Back</h1>
          <p className="eco-text-muted">Sign in to your Eco-Guardian account</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            <strong>Demo mode:</strong> use the quick access button below or sign in manually.
          </p>
        </motion.div>

        {/* Card */}
        <Card className="rounded-3xl border border-eco-100/80 bg-white/85 dark:border-slate-700 dark:bg-slate-900/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="eco-alert-error"
              >
                <span className="text-lg leading-relaxed">❌</span>
                <span className="flex-1 text-sm leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="eco-input"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔐 Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="eco-input"
              />
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer accent-eco-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <a
                href="#forgot"
                className="text-sm text-eco-600 dark:text-eco-400 hover:underline"
              >
                Forgot password?
              </a>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                loading={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🚀 Continue with demo account
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="eco-divider"></div>

            {/* Social Login (Optional) */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs eco-text-subtle text-center">Or continue with</p>
              <div className="flex gap-3">
                <button className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-eco-400 dark:hover:border-eco-400 transition text-lg">
                  🔵
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-eco-400 dark:hover:border-eco-400 transition text-lg">
                  🔴
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-eco-400 dark:hover:border-eco-400 transition text-lg">
                  🍎
                </button>
              </div>
            </motion.div>
          </form>
        </Card>

        {/* Signup Link */}
        <motion.p
          className="mt-6 text-center eco-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Don't have an account?{" "}
          <Link to="/signup" className="text-eco-600 dark:text-eco-400 font-semibold hover:underline">
            Sign Up
          </Link>
        </motion.p>

        {/* Trust Indicators */}
        <motion.div
          className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs eco-text-subtle">
            🔒 Your data is secure and encrypted. We never sell your information.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
