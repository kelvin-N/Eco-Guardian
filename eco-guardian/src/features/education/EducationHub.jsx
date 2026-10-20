import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getEducationProgress, saveEducationAttempt } from "../../services/educationService";
import { LESSONS } from "./lessons";

const CATEGORIES = ["All topics", ...new Set(LESSONS.map((lesson) => lesson.category))];
const PASSING_SCORE = 67;

export default function EducationHub() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [progress, setProgress] = useState({});
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All topics");
  const [search, setSearch] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setProgress(await getEducationProgress(userId));
      setError("");
    } catch (loadError) {
      console.error("Failed to load Education Hub progress:", loadError);
      setError(loadError.message || "Your learning progress could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const completedCount = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
  const completionPercent = Math.round((completedCount / LESSONS.length) * 100);
  const selectedLesson = LESSONS.find((lesson) => lesson.id === selectedLessonId);
  const visibleLessons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return LESSONS.filter((lesson) => {
      const matchesCategory = selectedCategory === "All topics"
        || lesson.category === selectedCategory;
      const matchesSearch = !normalizedSearch
        || `${lesson.title} ${lesson.summary} ${lesson.category}`.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const openLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    setAnswers({});
    setResult(null);
    setError("");
  };

  const handleSubmitQuiz = async (event) => {
    event.preventDefault();
    if (!selectedLesson || !userId) return;
    if (Object.keys(answers).length !== selectedLesson.quiz.length) {
      setError("Answer every question before submitting the quiz.");
      return;
    }

    const correctAnswers = selectedLesson.quiz.reduce(
      (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
      0
    );
    const score = Math.round((correctAnswers / selectedLesson.quiz.length) * 100);
    const passed = score >= PASSING_SCORE;
    setError("");
    setSubmitting(true);
    try {
      const savedResult = await saveEducationAttempt(
        userId,
        selectedLesson.id,
        score,
        passed
      );
      setProgress((previous) => ({ ...previous, [selectedLesson.id]: savedResult }));
      setResult({ score, correctAnswers, passed });
    } catch (saveError) {
      console.error("Failed to save Education Hub quiz result:", saveError);
      setError(saveError.message || "Your quiz result could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const retryQuiz = () => {
    setAnswers({});
    setResult(null);
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="eco-heading-xl mb-2">📚 Education Hub</h1>
            <p className="eco-text-muted mb-6">
              Learn practical sustainability skills, test your knowledge, and keep track of your progress.
            </p>

            {error && (
              <p className="eco-alert-error mb-6" role="alert">{error}</p>
            )}

            <Card className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="eco-heading-md">Your learning journey</h2>
                  <p className="eco-text-muted mt-1">
                    {loading
                      ? "Loading your saved progress…"
                      : `${completedCount} of ${LESSONS.length} lessons completed`}
                  </p>
                </div>
                <div className="w-full sm:max-w-xs">
                  <div
                    className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                    role="progressbar"
                    aria-label="Course completion"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={completionPercent}
                  >
                    <div
                      className="h-full rounded-full bg-eco-600 transition-all dark:bg-eco-400"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-sm font-medium text-eco-700 dark:text-eco-300">
                    {completionPercent}% complete
                  </p>
                </div>
              </div>
            </Card>

            {selectedLesson ? (
              <section aria-labelledby="lesson-title">
                <Button
                  type="button"
                  variant="outline"
                  className="mb-5"
                  onClick={() => {
                    setSelectedLessonId("");
                    setResult(null);
                    setAnswers({});
                    setError("");
                  }}
                >
                  ← All lessons
                </Button>

                <Card className="mb-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-eco-700 dark:text-eco-300">
                        {selectedLesson.icon} {selectedLesson.category} · {selectedLesson.duration} · {selectedLesson.level}
                      </p>
                      <h2 id="lesson-title" className="eco-heading-lg mt-2">
                        {selectedLesson.title}
                      </h2>
                      <p className="eco-text-muted mt-2">{selectedLesson.summary}</p>
                    </div>
                    {progress[selectedLesson.id]?.completed && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-200">
                        Completed · best {progress[selectedLesson.id].bestScore}%
                      </span>
                    )}
                  </div>

                  <div className="mt-8 space-y-7">
                    {selectedLesson.sections.map((section) => (
                      <section key={section.heading}>
                        <h3 className="eco-heading-md mb-3">{section.heading}</h3>
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="eco-text-muted mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </section>
                    ))}
                  </div>

                  <div className="mt-7 rounded-xl bg-eco-50 p-5 dark:bg-eco-900/20">
                    <h3 className="font-semibold text-eco-800 dark:text-eco-200">Key takeaway</h3>
                    <p className="mt-2 text-sm leading-relaxed text-eco-900 dark:text-eco-100">
                      {selectedLesson.takeaway}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="mb-6">
                    <h2 className="eco-heading-md">Quick knowledge check</h2>
                    <p className="eco-text-muted mt-1">
                      Get at least {PASSING_SCORE}% correct to complete this lesson. You can retry any time.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitQuiz} className="space-y-7">
                    {selectedLesson.quiz.map((question, questionIndex) => (
                      <fieldset key={question.question} className="space-y-3">
                        <legend className="font-semibold">
                          {questionIndex + 1}. {question.question}
                        </legend>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = answers[questionIndex] === optionIndex;
                            const showCorrect = result && optionIndex === question.answer;
                            const showIncorrect = result
                              && isSelected
                              && optionIndex !== question.answer;
                            return (
                              <label
                                key={option}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                                  showCorrect
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    : showIncorrect
                                      ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                                      : isSelected
                                        ? "border-eco-500 bg-eco-50 dark:bg-eco-900/20"
                                        : "border-gray-200 hover:border-eco-400 dark:border-gray-700"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  value={optionIndex}
                                  checked={isSelected}
                                  disabled={Boolean(result) || submitting}
                                  onChange={() => setAnswers((previous) => ({
                                    ...previous,
                                    [questionIndex]: optionIndex,
                                  }))}
                                  className="mt-0.5 accent-eco-600"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                        {result && (
                          <p className="text-sm eco-text-muted">
                            {question.explanation}
                          </p>
                        )}
                      </fieldset>
                    ))}

                    {result ? (
                      <div className={`rounded-xl p-4 ${
                        result.passed
                          ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                          : "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
                      }`} role="status">
                        <p className="font-semibold">
                          {result.passed ? "Lesson completed!" : "Not quite—give it another try."}
                          {" "}{result.correctAnswers}/{selectedLesson.quiz.length} correct ({result.score}%).
                        </p>
                        <p className="mt-1 text-sm">
                          Best score: {progress[selectedLesson.id]?.bestScore ?? result.score}% ·
                          {" "}Attempts: {progress[selectedLesson.id]?.attempts ?? 1}
                        </p>
                        <Button type="button" className="mt-4" variant="outline" onClick={retryQuiz}>
                          Try quiz again
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        disabled={submitting || Object.keys(answers).length !== selectedLesson.quiz.length}
                        loading={submitting}
                      >
                        {submitting ? "Saving result…" : "Submit answers"}
                      </Button>
                    )}
                  </form>
                </Card>
              </section>
            ) : (
              <section aria-labelledby="lesson-catalog-title">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 id="lesson-catalog-title" className="eco-heading-lg">Explore lessons</h2>
                  <label className="sr-only" htmlFor="lesson-search">Search lessons</label>
                  <input
                    id="lesson-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search topics…"
                    className="eco-input sm:max-w-xs"
                  />
                </div>

                <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter lessons by topic">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedCategory === category
                          ? "bg-eco-600 text-white dark:bg-eco-500"
                          : "bg-white text-gray-700 hover:bg-eco-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex justify-center py-16"><Loader size="lg" /></div>
                ) : visibleLessons.length === 0 ? (
                  <Card>
                    <p className="eco-text-muted">No lessons match that search. Try another topic or search term.</p>
                  </Card>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleLessons.map((lesson) => {
                      const lessonProgress = progress[lesson.id];
                      return (
                        <Card key={lesson.id} className="flex h-full flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-4xl" aria-hidden="true">{lesson.icon}</span>
                            {lessonProgress?.completed ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                Completed
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                Not started
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-eco-700 dark:text-eco-300">
                            {lesson.category} · {lesson.duration}
                          </p>
                          <h3 className="eco-heading-md mt-2">{lesson.title}</h3>
                          <p className="eco-text-muted mt-2 flex-1 text-sm">{lesson.summary}</p>
                          {lessonProgress && (
                            <p className="mt-3 text-xs eco-text-subtle">
                              Best score {lessonProgress.bestScore}% · {lessonProgress.attempts} {lessonProgress.attempts === 1 ? "attempt" : "attempts"}
                            </p>
                          )}
                          <Button type="button" className="mt-5 w-full" onClick={() => openLesson(lesson.id)}>
                            {lessonProgress?.completed ? "Review lesson" : lessonProgress ? "Continue lesson" : "Start lesson"}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
