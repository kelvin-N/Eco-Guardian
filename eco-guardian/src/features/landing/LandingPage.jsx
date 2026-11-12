import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: "🌱",
    title: "Track your footprint",
    description:
      "Keep an eye on your carbon impact and discover practical ways to make everyday choices greener.",
    link: "/carbon",
    linkText: "Explore carbon tracking",
  },
  {
    icon: "🎯",
    title: "Make good habits stick",
    description:
      "Log eco-friendly activities, work toward goals, and take on challenges that turn intention into action.",
    link: "/challenges",
    linkText: "See community challenges",
  },
  {
    icon: "🌍",
    title: "Grow together",
    description:
      "Find events, learn from useful resources, and connect your efforts with a community that cares.",
    link: "/events",
    linkText: "Explore events",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Set up your free account and make Eco-Guardian yours.",
  },
  {
    number: "02",
    title: "Choose an action",
    description: "Find a challenge or log a sustainable activity that fits your day.",
  },
  {
    number: "03",
    title: "See your progress",
    description: "Build momentum as you track your impact and celebrate what you do.",
  },
];

export default function LandingPage() {
  const { currentUser } = useAuth();
  const startLink = currentUser ? "/dashboard" : "/signup";
  const startLabel = currentUser ? "Open your dashboard" : "Get started for free";

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfdf8] text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="relative z-10">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5"
        >
          <Link to="/" className="flex items-center gap-2 sm:gap-3" aria-label="Eco-Guardian home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl sm:h-11 sm:w-11 dark:bg-emerald-900/50">
              🌍
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-emerald-800 sm:text-lg dark:text-emerald-300">
                Eco-Guardian
              </span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block dark:text-slate-400">
                Small steps. Lasting change.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300"
            >
              What you can do
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            {!currentUser && (
              <Link
                to="/login"
                className="inline-flex rounded-full px-2 py-2 text-xs font-bold text-slate-700 hover:bg-white sm:px-4 sm:text-sm dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            )}
            <Link
              to={startLink}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:px-5 sm:text-sm dark:focus:ring-offset-slate-950"
            >
              <span className="sm:hidden">{currentUser ? "Open app" : "Join"}</span>
              <span className="hidden sm:inline">
                {currentUser ? "Open app" : "Get started"}
              </span>
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute -right-36 -top-20 -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/25"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-slate-900/80 dark:text-emerald-300">
              <span aria-hidden="true">✳</span>
              A little better, every day
            </div>
            <h1 className="text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
              Your greener life{" "}
              <span className="text-emerald-700 dark:text-emerald-400">
                starts with one step.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Make sustainable living feel doable. Track your actions, discover
              new habits, and make progress alongside a community that cares
              about the planet.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={startLink}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 text-base font-bold text-white shadow-xl shadow-emerald-900/15 hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              >
                {startLabel}
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#features"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-7 text-base font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-emerald-600 dark:hover:text-emerald-300"
              >
                Explore the platform
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Free to join. Start wherever you are.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div
              aria-hidden="true"
              className="absolute -left-8 top-12 h-24 w-24 rounded-full bg-lime-300/70 blur-2xl dark:bg-lime-700/30"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -right-5 h-40 w-40 rounded-full bg-cyan-200/70 blur-3xl dark:bg-cyan-900/40"
            />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-7 dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    A SAMPLE PROGRESS VIEW
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                    Every action adds up
                  </h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/60">
                  🌿
                </span>
              </div>

              <div className="mt-7 rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-800 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">
                      A more mindful routine
                    </p>
                    <p className="mt-2 text-3xl font-black">Start with today</p>
                  </div>
                  <span className="text-4xl" aria-hidden="true">☀️</span>
                </div>
                <div className="mt-8 flex items-end gap-2" aria-hidden="true">
                  {[34, 48, 40, 67, 55, 78, 64, 92, 75, 100, 82, 94].map(
                    height => (
                      <span
                        key={height}
                        className="flex-1 rounded-t-md bg-white/25"
                        style={{ height: `${height}px` }}
                      />
                    )
                  )}
                </div>
                <p className="mt-3 text-xs font-medium text-emerald-100">
                  Your progress is personal. Every step counts.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-xl dark:bg-amber-900/50">
                    🚲
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Choose a greener trip</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Log an activity and build a habit
                    </p>
                  </div>
                  <span className="text-lg text-emerald-700 dark:text-emerald-400" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-xl dark:bg-sky-900/50">
                    🤝
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Take on a community challenge</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Make change with others
                    </p>
                  </div>
                  <span className="text-lg text-emerald-700 dark:text-emerald-400" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:flex dark:border-slate-700 dark:bg-slate-800">
              <span className="text-2xl" aria-hidden="true">🌎</span>
              <span className="text-sm font-bold">Better choices, together</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-8 border-y border-emerald-100 bg-white/70 py-20 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              Make it meaningful
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              A planet-friendly life, made practical
            </h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              Helpful tools and a welcoming community can make the next good
              choice easier to find.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-900/40">
                  {feature.icon}
                </span>
                <h3 className="mt-6 text-xl font-extrabold">{feature.title}</h3>
                <p className="mt-3 min-h-[5rem] leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
                <Link
                  to={currentUser ? feature.link : "/signup"}
                  className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-800 group-hover:gap-3 dark:text-emerald-300"
                >
                  {feature.linkText}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-8 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                No perfection required
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Progress looks different for everyone.
              </h2>
              <p className="mt-4 max-w-lg leading-7 text-slate-600 dark:text-slate-300">
                Start small, find what works for you, and keep moving forward.
                Eco-Guardian is here to help you notice the difference you make.
              </p>
              <Link
                to={startLink}
                className="mt-7 inline-flex items-center gap-2 font-bold text-emerald-800 hover:gap-3 dark:text-emerald-300"
              >
                {startLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="text-sm font-black tracking-widest text-emerald-700 dark:text-emerald-400">
                    {step.number}
                  </p>
                  <h3 className="mt-5 font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-800 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <span className="text-4xl" aria-hidden="true">🌿</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Your next step can start right here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-emerald-100">
            Join Eco-Guardian and make space for more thoughtful choices, one
            day at a time.
          </p>
          <Link
            to={startLink}
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-white px-7 py-3 font-extrabold text-emerald-900 hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-800"
          >
            {startLabel}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-7 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-slate-500 sm:flex-row sm:px-8 dark:text-slate-400">
          <Link to="/" className="font-extrabold text-emerald-800 dark:text-emerald-300">
            🌍 Eco-Guardian
          </Link>
          <p>© {new Date().getFullYear()} Eco-Guardian. Small steps matter.</p>
          {!currentUser && (
            <Link to="/login" className="font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">
              Sign in
            </Link>
          )}
        </div>
      </footer>
    </main>
  );
}
