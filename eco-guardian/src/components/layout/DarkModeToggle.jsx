import { motion as Motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
    >
      <Motion.span
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-block text-lg"
      >
        {isDark ? "☀️" : "🌙"}
      </Motion.span>
    </Motion.button>
  );
}
