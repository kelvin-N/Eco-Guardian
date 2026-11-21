import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  createCommunityPost,
  getPendingCommunityPosts,
  getPublishedCommunityPosts,
  updateCommunityPostStatus,
} from "../../services/communityService";
import { getCommunityPostImageBlob, validateCommunityPostImages } from "../../firebase/storage";

const POST_TOPICS = [
  "Climate",
  "Wildlife",
  "Cleanups",
  "Recycling",
  "Community",
  "Other",
];
const MAX_POST_IMAGES = 3;

function formatPostDate(timestamp) {
  const date = timestamp?.toDate?.();
  return date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
    : "Just now";
}

function PostPhoto({ post, imageNumber }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    getCommunityPostImageBlob(post.authorUid, post.id, imageNumber)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setPhotoUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch((loadError) => {
        console.error("Failed to load community post photo:", loadError);
        if (active) setError("This photo could not be loaded.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageNumber, post.authorUid, post.id]);

  if (error) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {error}
      </div>
    );
  }
  if (!photoUrl) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Loading photo…
      </div>
    );
  }
  return (
    <img
      src={photoUrl}
      alt={`Photo ${imageNumber} shared by ${post.authorName}`}
      loading="lazy"
      className="max-h-[28rem] w-full rounded-xl bg-gray-100 object-contain dark:bg-gray-800"
    />
  );
}

function SelectedPhoto({ file, onRemove }) {
  const imageRef = useRef(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    if (imageRef.current) imageRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative">
      <img
        ref={imageRef}
        alt={`Selected photo: ${file.name}`}
        className="h-24 w-24 rounded-lg object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
      >
        ×
      </button>
    </div>
  );
}

function PostCard({ post, admin, busy, onReview }) {
  const imageCount = Math.max(0, Math.min(Number(post.imageCount) || 0, MAX_POST_IMAGES));

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {post.authorName || "Community member"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {post.topic} · {formatPostDate(post.createdAt)}
          </p>
        </div>
        {admin && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            Awaiting review
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
        {post.content}
      </p>

      {imageCount > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: imageCount }, (_, index) => (
            <PostPhoto
              key={`${post.id}-${index + 1}`}
              post={post}
              imageNumber={index + 1}
            />
          ))}
        </div>
      )}

      {post.sourceUrl && (
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-eco-700 underline underline-offset-2 hover:text-eco-800 dark:text-eco-300 dark:hover:text-eco-200"
        >
          View source
        </a>
      )}

      {admin && (
        <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            type="button"
            size="sm"
            loading={busy === "published"}
            disabled={Boolean(busy)}
            onClick={() => onReview(post.id, "published")}
          >
            Publish
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={busy === "rejected"}
            disabled={Boolean(busy)}
            onClick={() => onReview(post.id, "rejected")}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function CommunityBlog() {
  const { currentUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";
  const fileInputRef = useRef(null);
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("Community");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [busyReview, setBusyReview] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const requests = [getPublishedCommunityPosts()];
    if (isAdmin) requests.push(getPendingCommunityPosts());

    Promise.allSettled(requests)
      .then(([feedResult, reviewResult]) => {
        if (!active) return;
        if (feedResult.status === "fulfilled") {
          setPublishedPosts(feedResult.value);
          setFeedError("");
        } else {
          console.error("Failed to load community posts:", feedResult.reason);
          setFeedError("Community posts could not be loaded. Please try again.");
        }
        if (isAdmin && reviewResult) {
          if (reviewResult.status === "fulfilled") {
            setPendingPosts(reviewResult.value);
            setReviewError("");
          } else {
            console.error("Failed to load posts awaiting review:", reviewResult.reason);
            setReviewError("Posts awaiting review could not be loaded.");
          }
        } else {
          setPendingPosts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdmin, refreshKey]);

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setImageFiles(files);
    setFormError("");
    try {
      validateCommunityPostImages(files);
    } catch (validationError) {
      setFormError(validationError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormMessage("");
    if (!consentConfirmed) {
      setFormError("Confirm that you have permission to share the people and media in your post.");
      return;
    }

    setSubmitting(true);
    try {
      const authorName =
        userProfile?.displayName
        || currentUser.displayName
        || currentUser.email?.split("@")[0]
        || "";
      await createCommunityPost(
        currentUser.uid,
        authorName,
        { content, topic, sourceUrl },
        imageFiles
      );
      setContent("");
      setTopic("Community");
      setSourceUrl("");
      setImageFiles([]);
      setConsentConfirmed(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormMessage("Your post was submitted for administrator review.");
      setRefreshKey((key) => key + 1);
    } catch (submitError) {
      console.error("Failed to submit community post:", submitError);
      setFormError(submitError.message || "Your post could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (postId, status) => {
    setBusyReview({ postId, status });
    setReviewError("");
    setActionMessage("");
    try {
      await updateCommunityPostStatus(postId, status);
      setPendingPosts((posts) => posts.filter((post) => post.id !== postId));
      setActionMessage(status === "published" ? "Post published." : "Post rejected.");
      setRefreshKey((key) => key + 1);
    } catch (reviewActionError) {
      console.error("Failed to review community post:", reviewActionError);
      setReviewError("The post review action failed. Please try again.");
    } finally {
      setBusyReview(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="eco-container">
          <header className="mb-8">
            <h1 className="eco-heading-2xl mb-2">📰 News & Stories</h1>
            <p className="eco-text-muted max-w-3xl">
              Share environmental updates and community stories. Posts appear
              in the feed after an administrator reviews them.
            </p>
          </header>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <section aria-labelledby="community-feed-heading" className="space-y-5">
              {isAdmin && (
                <div>
                  <h2 id="review-queue-heading" className="eco-heading-lg mb-4">
                    Posts awaiting review
                  </h2>
                  {reviewError && <p className="eco-alert-error mb-4" role="alert">{reviewError}</p>}
                  {actionMessage && <p className="eco-alert-success mb-4" role="status">{actionMessage}</p>}
                  {!loading && pendingPosts.length === 0 && !reviewError && (
                    <Card>
                      <p className="eco-text-muted">There are no posts awaiting review.</p>
                    </Card>
                  )}
                  {pendingPosts.map((post) => (
                    <div className="mb-4" key={post.id}>
                      <PostCard
                        post={post}
                        admin
                        busy={busyReview?.postId === post.id ? busyReview.status : null}
                        onReview={handleReview}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h2 id="community-feed-heading" className="eco-heading-lg mb-4">
                  Community feed
                </h2>
                {feedError && <p className="eco-alert-error mb-4" role="alert">{feedError}</p>}
                {loading && <Loader size="lg" className="py-12" />}
                {!loading && !feedError && publishedPosts.length === 0 && (
                  <Card>
                    <p className="eco-text-muted">
                      No stories have been published yet. Be the first to share one.
                    </p>
                  </Card>
                )}
                {!loading && publishedPosts.map((post) => (
                  <div className="mb-4" key={post.id}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              <Card>
                <h2 className="eco-heading-lg mb-2">Share a story</h2>
                <p className="eco-text-muted mb-5 text-sm">
                  Share a useful update, a source link, and up to three photos.
                  Photos must be JPEG, PNG, or WebP and no larger than 8 MB each.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="post-content" className="mb-1 block text-sm font-semibold">
                      Your story
                    </label>
                    <textarea
                      id="post-content"
                      required
                      minLength={20}
                      maxLength={2000}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      rows={6}
                      className="eco-input"
                      placeholder="What is happening in your community or environment?"
                    />
                    <p className="mt-1 text-right text-xs text-gray-500">
                      {content.length}/2,000
                    </p>
                  </div>

                  <div>
                    <label htmlFor="post-topic" className="mb-1 block text-sm font-semibold">
                      Topic
                    </label>
                    <select
                      id="post-topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      className="eco-input"
                    >
                      {POST_TOPICS.map((postTopic) => (
                        <option key={postTopic} value={postTopic}>{postTopic}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="post-source" className="mb-1 block text-sm font-semibold">
                      Source link <span className="font-normal text-gray-500">(optional, HTTPS)</span>
                    </label>
                    <input
                      id="post-source"
                      type="url"
                      value={sourceUrl}
                      onChange={(event) => setSourceUrl(event.target.value)}
                      className="eco-input"
                      placeholder="https://example.com/news"
                    />
                  </div>

                  <div>
                    <label htmlFor="post-photos" className="mb-1 block text-sm font-semibold">
                      Photos <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="post-photos"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelection}
                      className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-eco-100 file:px-3 file:py-2 file:font-semibold file:text-eco-800 dark:text-gray-300 dark:file:bg-eco-900/50 dark:file:text-eco-200"
                    />
                    {imageFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {imageFiles.map((file, index) => (
                          <SelectedPhoto
                            key={`${file.name}-${file.lastModified}-${index}`}
                            file={file}
                            onRemove={() => setImageFiles((files) =>
                              files.filter((_, fileIndex) => fileIndex !== index)
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      required
                      checked={consentConfirmed}
                      onChange={(event) => setConsentConfirmed(event.target.checked)}
                      className="mt-1 accent-eco-600"
                    />
                    <span>
                      I have permission to share identifiable people in these
                      photos and have checked for private location or device
                      details.
                    </span>
                  </label>

                  {formError && <p className="eco-alert-error" role="alert">{formError}</p>}
                  {formMessage && <p className="eco-alert-success" role="status">{formMessage}</p>}
                  <Button type="submit" loading={submitting} className="w-full">
                    Submit for review
                  </Button>
                </form>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
