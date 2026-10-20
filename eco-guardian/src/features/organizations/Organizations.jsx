import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { createOrganizationInquiry } from "../../services/organizationService";

const ORGANIZATION_TYPES = ["School", "NGO", "Business", "Community group", "Other"];
const PILOT_INTERESTS = [
  "Sustainability learning",
  "Group eco-challenges",
  "Community events",
  "Environmental impact reporting",
  "Other",
];
const EMPTY_FORM = {
  organizationName: "",
  contactName: "",
  organizationType: "",
  interests: [],
  message: "",
};

export default function Organizations() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggleInterest = (interest) => {
    setForm((previous) => ({
      ...previous,
      interests: previous.interests.includes(interest)
        ? previous.interests.filter((item) => item !== interest)
        : [...previous.interests, interest],
    }));
  };

  const submitInquiry = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!currentUser?.uid || !currentUser.email) {
      setError("Sign in with an account that has an email address to submit an inquiry.");
      return;
    }

    setSubmitting(true);
    try {
      await createOrganizationInquiry(currentUser.uid, currentUser.email, form);
      setForm(EMPTY_FORM);
      setSuccess("Thanks for your interest. Your inquiry has been sent for follow-up.");
    } catch (submitError) {
      console.error("Failed to submit organization inquiry:", submitError);
      setError(submitError.message || "Your inquiry could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <section className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-eco-700 dark:text-eco-300">
                Eco-Guardian for organizations
              </p>
              <h1 className="eco-heading-xl mt-3">
                Help your community put sustainability into practice.
              </h1>
              <p className="eco-text-muted mt-4 text-lg">
                We’re exploring pilot programs with schools, NGOs, businesses, and community groups.
                Tell us what your organization needs, and we can discuss whether Eco-Guardian is a fit.
              </p>
              <span className="mt-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                Early pilot conversations · No published pricing or subscription yet
              </span>
            </section>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
              <section aria-labelledby="pilot-ideas">
                <h2 id="pilot-ideas" className="eco-heading-lg mb-4">What we could explore together</h2>
                <div className="space-y-4">
                  <Card>
                    <p className="text-2xl" aria-hidden="true">📚</p>
                    <h3 className="eco-heading-md mt-3">Learning programs</h3>
                    <p className="eco-text-muted mt-2">
                      Use the Education Hub’s sustainability lessons as a starting point for a school or community learning program.
                    </p>
                  </Card>
                  <Card>
                    <p className="text-2xl" aria-hidden="true">🌱</p>
                    <h3 className="eco-heading-md mt-3">Group challenges</h3>
                    <p className="eco-text-muted mt-2">
                      Discuss practical ways to bring activity tracking and eco-challenges to a team or community.
                      Group workspaces and organization dashboards are not available yet.
                    </p>
                  </Card>
                  <Card>
                    <p className="text-2xl" aria-hidden="true">🤝</p>
                    <h3 className="eco-heading-md mt-3">Community collaboration</h3>
                    <p className="eco-text-muted mt-2">
                      Explore whether community events, environmental learning, and local partnerships can support your goals.
                    </p>
                  </Card>
                </div>
              </section>

              <section aria-labelledby="inquiry-title">
                <Card>
                  <h2 id="inquiry-title" className="eco-heading-lg">Start a pilot conversation</h2>
                  <p className="eco-text-muted mt-2">
                    Share a few details. We’ll use them only to review and respond to this inquiry.
                  </p>
                  {error && <p className="eco-alert-error mt-5" role="alert">{error}</p>}
                  {success && <p className="eco-alert-success mt-5" role="status">{success}</p>}

                  <form onSubmit={submitInquiry} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium">
                      Organization name
                      <input
                        required
                        minLength={2}
                        maxLength={120}
                        value={form.organizationName}
                        onChange={(event) => setForm({ ...form, organizationName: event.target.value })}
                        className="eco-input mt-2"
                        autoComplete="organization"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Your name
                      <input
                        required
                        minLength={2}
                        maxLength={80}
                        value={form.contactName}
                        onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                        className="eco-input mt-2"
                        autoComplete="name"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Organization type
                      <select
                        required
                        value={form.organizationType}
                        onChange={(event) => setForm({ ...form, organizationType: event.target.value })}
                        className="eco-input mt-2"
                      >
                        <option value="" disabled>Select one</option>
                        {ORGANIZATION_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                    <fieldset>
                      <legend className="text-sm font-medium">
                        What would you like to explore?
                      </legend>
                      <div className="mt-2 space-y-2">
                        {PILOT_INTERESTS.map((interest) => (
                          <label key={interest} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.interests.includes(interest)}
                              onChange={() => toggleInterest(interest)}
                              className="accent-eco-600"
                            />
                            {interest}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label className="block text-sm font-medium">
                      Tell us about your goals
                      <textarea
                        required
                        minLength={10}
                        maxLength={1500}
                        rows={5}
                        value={form.message}
                        onChange={(event) => setForm({ ...form, message: event.target.value })}
                        className="eco-input mt-2"
                        placeholder="What are you hoping to achieve, and who would take part?"
                      />
                    </label>
                    <p className="text-xs eco-text-subtle">
                      Submitting an inquiry does not create a contract, subscription, or paid plan.
                      We don’t sell personal or environmental activity data.
                    </p>
                    <Button type="submit" disabled={submitting} loading={submitting}>
                      {submitting ? "Sending inquiry…" : "Send pilot inquiry"}
                    </Button>
                  </form>
                </Card>
              </section>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
