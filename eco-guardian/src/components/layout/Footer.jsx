import { Link } from "react-router-dom";

const socialLinks = [
  { id: "twitter", label: "Twitter", color: "#1DA1F2" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
];

function SocialIcon({ id, label, color }) {
  const commonProps = {
    "aria-label": label,
    className: "h-6 w-6 transition-transform group-hover:scale-110",
    fill: color || "currentColor",
    role: "img",
    viewBox: "0 0 24 24",
  };

  if (id === "twitter") {
    return (
      <svg {...commonProps}>
        <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.932 4.932 0 0 0 2.163-2.723 9.99 9.99 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.95 13.95 0 0 1 1.64 3.162a4.916 4.916 0 0 0 1.523 6.557 4.9 4.9 0 0 1-2.228-.616v.062a4.918 4.918 0 0 0 3.946 4.817 4.93 4.93 0 0 1-2.22.084 4.92 4.92 0 0 0 4.592 3.415A9.87 9.87 0 0 1 0 19.54a13.93 13.93 0 0 0 7.548 2.213c9.057 0 14.01-7.504 14.01-14.01 0-.213-.005-.425-.014-.636a10.01 10.01 0 0 0 2.409-2.547Z" />
      </svg>
    );
  }

  if (id === "facebook") {
    return (
      <svg {...commonProps}>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.003 10.125 11.854v-8.385H7.078v-3.469h3.047V9.429c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.953h-1.513c-1.491 0-1.956.93-1.956 1.885v2.267h3.328l-.532 3.469h-2.796v8.385C19.612 23.076 24 18.092 24 12.073Z" />
      </svg>
    );
  }

  if (id === "instagram") {
    return (
      <svg {...commonProps} fill="none" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="instagram-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEDA75" />
            <stop offset=".35" stopColor="#FA7E1E" />
            <stop offset=".65" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="url(#instagram-gradient)" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="4.5" stroke="url(#instagram-gradient)" strokeWidth="2.2" />
        <circle cx="18" cy="6.5" r="1.3" fill="#D62976" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#security" },
      { label: "Status", href: "#status" },
    ],
    Community: [
      { label: "Blog", href: "#blog" },
      { label: "Forum", href: "#forum" },
      { label: "Events", href: "#events" },
      { label: "Newsletter", href: "#newsletter" },
    ],
    Company: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Press", href: "#press" },
    ],
    Legal: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Cookies", href: "#cookies" },
      { label: "License", href: "#license" },
    ],
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="eco-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
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
            {/* Social Links */}
            <div className="mt-4 flex items-center gap-4" aria-label="Social media platforms">
              {socialLinks.map((social) => (
                <span
                  key={social.label}
                  title={social.label}
                  className="group inline-flex items-center justify-center rounded-md p-1 text-gray-500 transition hover:opacity-75 dark:text-gray-300"
                >
                  <SocialIcon {...social} />
                  <span className="sr-only">{social.label}</span>
                </span>
              ))}
            </div>
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
                    <a
                      href={link.href}
                      className="eco-text-muted hover:text-eco-600 dark:hover:text-eco-400 transition text-sm"
                    >
                      {link.label}
                    </a>
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
            <a href="#privacy" className="hover:text-eco-600 dark:hover:text-eco-400 transition">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-eco-600 dark:hover:text-eco-400 transition">
              Terms of Service
            </a>
            <a href="#cookies" className="hover:text-eco-600 dark:hover:text-eco-400 transition">
              Cookie Settings
            </a>
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
          <button className="px-6 py-2 bg-white text-eco-600 rounded-lg font-semibold hover:bg-eco-50 transition whitespace-nowrap">
            Get Started
          </button>
        </div>
      </div>
    </footer>
  );
}
