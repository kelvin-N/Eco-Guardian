import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup, configurationError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      setSuccess("Account created! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 px-4 py-8">
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
          <div className="flex justify-center mb-4">
            <div className="text-6xl">🌱</div>
          </div>
          <h1 className="eco-heading-lg mb-2">Welcome to Eco-Guardian</h1>
          <p className="eco-text-muted">Create an account to start your eco-journey</p>
        </motion.div>

        {/* Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {configurationError && (
              <div role="alert" className="eco-alert-error">
                <span className="flex-1 text-sm leading-relaxed">{configurationError}</span>
              </div>
            )}

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

            {/* Success Alert */}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="eco-alert-success"
              >
                <span className="flex-1">✓ {success}</span>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="eco-input"
              />
              <p className="text-xs eco-text-subtle mt-1">
                Must be at least 6 characters long
              </p>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔐 Confirm Password
              </label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="eco-input"
              />
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
                disabled={loading || Boolean(configurationError)}
                loading={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="eco-divider"></div>

            {/* Terms */}
            <p className="text-xs eco-text-subtle text-center">
              By signing up, you agree to our{" "}
              <a href="#terms" className="text-eco-600 dark:text-eco-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="text-eco-600 dark:text-eco-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </Card>

        {/* Login Link */}
        <motion.p
          className="mt-6 text-center eco-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Already have an account?{" "}
          <Link to="/login" className="text-eco-600 dark:text-eco-400 font-semibold hover:underline">
            Sign In
          </Link>
        </motion.p>

        {/* Features Preview */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "🎯", title: "Track Impact" },
            { icon: "🏆", title: "Compete" },
            { icon: "🌍", title: "Make Change" },
          ].map((feature, i) => (
            <div
              key={i}
              className="text-center p-3 eco-card text-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-1">{feature.icon}</div>
              <p className="font-medium eco-text-muted">{feature.title}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
