import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Track: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Carbon tracker", to: "/carbon" },
      { label: "Waste reporting", to: "/waste" },
      { label: "Analytics", to: "/analytics" },
    ],
    Explore: [
      { label: "Education", to: "/education" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "Organizations", to: "/organizations" },
      { label: "Leaderboard", to: "/leaderboard" },
    ],
    Community: [
      { label: "Community", to: "/community" },
      { label: "Challenges", to: "/challenges" },
      { label: "Events", to: "/events" },
      { label: "Reports", to: "/reports" },
    ],
    Account: [
      { label: "Profile", to: "/profile" },
      { label: "Settings", to: "/settings" },
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/signup" },
    ],
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="eco-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/dashboard" className="flex items-center gap-2 mb-4">
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
            <p className="eco-text-muted text-sm">
              Making environmental impact easy for everyone through technology and community.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="eco-text-muted hover:text-eco-600 dark:hover:text-eco-400 transition text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="eco-divider mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="eco-text-subtle text-center md:text-left">
            © {currentYear} Eco-Guardian. All rights reserved.
          </p>
          <div className="flex gap-6 eco-text-subtle">
            <Link to="/login" className="hover:text-eco-600 dark:hover:text-eco-400 transition">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-eco-600 dark:hover:text-eco-400 transition">
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Banner */}
      <div className="bg-gradient-to-r from-eco-500 to-blue-500 text-white py-4">
        <div className="eco-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">🌱 Join our mission to save the planet</p>
            <p className="text-eco-50 text-sm">Start your eco-journey today!</p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-2 bg-white text-eco-600 rounded-lg font-semibold hover:bg-eco-50 transition whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  );
}
