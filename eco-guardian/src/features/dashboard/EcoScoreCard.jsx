import { motion as Motion } from "framer-motion";
import useEcoScore from "../../hooks/useEcoScore";

export default function EcoScoreCard() {
  const { ecoScore, addEcoPoint } = useEcoScore();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-lg mb-2">Your Eco Score</h2>

      <Motion.div
        key={ecoScore}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-bold text-green-500 mb-4"
      >
        {ecoScore}
      </Motion.div>

      <button
        onClick={addEcoPoint}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        ➕ Complete Eco Action
      </button>
    </div>
  );
}
