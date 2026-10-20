import { useCallback, useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import {
  createCommunityEvent,
  getCommunityEvents,
  getUserEventRsvps,
  setEventRsvp,
} from "../../services/communityService";

const EMPTY_EVENT = { title: "", description: "", location: "", startsAt: "" };

function formatEventDate(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function toLocalDateTimeInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Events() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState(() => new Set());
  const [form, setForm] = useState(EMPTY_EVENT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyEventId, setBusyEventId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const minimumEventDate = toLocalDateTimeInput(new Date(Date.now() + 60_000));

  const loadEvents = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextEvents, nextRsvps] = await Promise.all([
        getCommunityEvents(),
        getUserEventRsvps(userId),
      ]);
      setEvents(nextEvents);
      setRsvps(nextRsvps);
      setError("");
    } catch (loadError) {
      console.error("Failed to load community events:", loadError);
      setError(loadError.message || "Events could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!userId) {
      setError("Sign in to create a community event.");
      return;
    }

    const startsAt = new Date(form.startsAt);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      setError("Choose an event date and time in the future.");
      return;
    }

    setSubmitting(true);
    try {
      await createCommunityEvent(userId, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        startsAt: Timestamp.fromDate(startsAt),
      });
      setForm(EMPTY_EVENT);
      setMessage("Your event was published to the community.");
      await loadEvents();
    } catch (createError) {
      console.error("Failed to create community event:", createError);
      setError(createError.message || "Your event could not be published.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRsvp = async (eventId) => {
    if (!userId) return;
    const attending = !rsvps.has(eventId);
    setBusyEventId(eventId);
    setError("");
    setMessage("");
    try {
      await setEventRsvp(userId, eventId, attending);
      setRsvps((previous) => {
        const next = new Set(previous);
        if (attending) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      setMessage(attending ? "You're on the attendee list." : "Your RSVP was removed.");
    } catch (rsvpError) {
      console.error("Failed to update event RSVP:", rsvpError);
      setError(rsvpError.message || "Your RSVP could not be updated.");
    } finally {
      setBusyEventId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="eco-heading-xl mb-2">🎯 Community Events</h1>
            <p className="eco-text-muted mb-6">
              Discover local eco-events or organize one for your community.
            </p>

            {(error || message) && (
              <p className={error ? "eco-alert-error mb-6" : "eco-alert-success mb-6"} role={error ? "alert" : "status"}>
                {error || message}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <section>
                <h2 className="eco-heading-lg mb-4">Upcoming events</h2>
                {loading ? (
                  <div className="flex justify-center py-16"><Loader size="lg" /></div>
                ) : events.length === 0 ? (
                  <Card>
                    <p className="eco-text-muted">No upcoming events yet. Start one for your community.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {events.map((communityEvent) => {
                      const isAttending = rsvps.has(communityEvent.id);
                      return (
                        <Card key={communityEvent.id}>
                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                              <p className="text-sm font-semibold text-eco-700 dark:text-eco-300">
                                {formatEventDate(communityEvent.startsAt)}
                              </p>
                              <h3 className="eco-heading-md mt-1">{communityEvent.title}</h3>
                              <p className="mt-2 text-sm eco-text-muted">{communityEvent.description}</p>
                              <p className="mt-3 text-sm">📍 {communityEvent.location}</p>
                              {communityEvent.createdBy === userId && (
                                <p className="mt-2 text-xs eco-text-subtle">Organized by you</p>
                              )}
                            </div>
                            <div className="shrink-0 self-start">
                              <Button
                                type="button"
                                variant={isAttending ? "secondary" : "primary"}
                                disabled={busyEventId === communityEvent.id}
                                onClick={() => toggleRsvp(communityEvent.id)}
                              >
                                {busyEventId === communityEvent.id
                                  ? "Updating..."
                                  : isAttending
                                    ? "Cancel RSVP"
                                    : "I'm interested"}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

              <Card>
                <h2 className="eco-heading-lg mb-2">Organize an event</h2>
                <p className="eco-text-muted mb-5 text-sm">
                  Your event will be visible to signed-in community members.
                </p>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <label className="block text-sm font-medium">
                    Event name
                    <input
                      required
                      maxLength={100}
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      className="eco-input mt-2"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Description
                    <textarea
                      maxLength={1000}
                      rows={4}
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      className="eco-input mt-2"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Location
                    <input
                      required
                      maxLength={160}
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                      className="eco-input mt-2"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Date and time
                    <input
                      required
                      type="datetime-local"
                      min={minimumEventDate}
                      value={form.startsAt}
                      onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                      className="eco-input mt-2"
                    />
                  </label>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish event"}
                  </Button>
                </form>
              </Card>
            </div>
          </Motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
