import { motion as Motion } from "framer-motion";
import useEcoScore from "../../hooks/useEcoScore";

const BADGE_MAP = {
  beginner: "🌱 Beginner",
  starter: "🌿 Eco Starter",
  hero: "🌳 Green Hero",
  protector: "🌎 Planet Protector",
  legend: "🔥 Eco Legend",
};

export default function Achievements() {
  const { achievements } = useEcoScore();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-lg font-semibold mb-4">🏅 Achievements</h2>

      <div className="flex flex-wrap gap-3">
        {achievements.map((a) => (
          <Motion.div
            key={a.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="px-4 py-2 bg-green-100 dark:bg-green-700 rounded-lg"
          >
            {BADGE_MAP[a.id]}
          </Motion.div>
        ))}
      </div>
    </div>
  );
}
