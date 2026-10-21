import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <Motion.div
        className="text-center p-8 eco-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="eco-heading-lg text-red-600 mb-4">Access Denied</h1>
        <p className="mb-6">
          You must be an **admin** to view that page. If you believe this is a
          mistake, please contact the site administrator.
        </p>
        <Link to="/login">
          <button className="eco-btn eco-btn-primary">Go to Login</button>
        </Link>
      </Motion.div>
    </div>
  );
}
