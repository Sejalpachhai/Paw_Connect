"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

type StoryMedia = {
  id?: number;
  media_url?: string;
  media_type?: string;
};

type StoryRowFromBackend = {
  id?: number;
  story_id?: number;

  title: string;
  description?: string;
  location_tag?: string;

  created_at?: string;

  // backend returns these (flat)
  user_id?: number;
  user_name?: string;
  user_email?: string;

  media?: StoryMedia[];
};

type Story = {
  id?: number;
  title: string;
  description?: string;
  location_tag?: string;
  created_at?: string;
  user?: { name?: string; email?: string };
  media?: StoryMedia[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  // ✅ API base (no /api at the end)
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  const [stories, setStories] = useState<Story[]>([]);
  const [fetchingStories, setFetchingStories] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  // UI messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // to reset the file input UI
  const [fileInputKey, setFileInputKey] = useState(0);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  // redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const logout = async () => {
    localStorage.removeItem("token");
    await refreshUser();
    router.replace("/login");
  };

  // ✅ normalize backend story row -> UI story
  const normalizeStory = (row: StoryRowFromBackend): Story => {
    return {
      id: row.id ?? row.story_id,
      title: row.title,
      description: row.description,
      location_tag: row.location_tag,
      created_at: row.created_at,
      user: {
        name: row.user_name,
        email: row.user_email,
      },
      media: Array.isArray(row.media) ? row.media : [],
    };
  };

  // ✅ fix media URL:
  // - Cloudinary returns https://...
  // - local upload returns /uploads/...
  const resolveMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return url;
  };

  const fetchStories = async () => {
    setFetchingStories(true);
    setErrorMsg(null);

    try {
      // GET /api/stories is public in your backend
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Stories fetch failed (${res.status}). ${
            text?.slice(0, 120) || "Check backend route /api/stories"
          }`
        );
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.stories || [];
      const normalized = (list as StoryRowFromBackend[]).map(normalizeStory);

      setStories(normalized);
    } catch (e: any) {
      setStories([]);
      setErrorMsg(e?.message || "Failed to load stories");
    } finally {
      setFetchingStories(false);
    }
  };

  useEffect(() => {
    if (!loading && user) fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected.slice(0, 6));
  };

  const resetForm = () => {
    setTitle("");
    setLocationTag("");
    setDescription("");
    setFiles([]);
    setFileInputKey((k) => k + 1); // resets input UI
  };

  const postStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = getToken();
      if (!token) throw new Error("No token found. Please login again.");

      if (!title.trim()) throw new Error("Title is required.");

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("location_tag", locationTag.trim());
      fd.append("description", description.trim());

      // ✅ IMPORTANT: backend expects "media"
      files.forEach((file) => fd.append("media", file));

      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT set Content-Type for FormData
        },
        body: fd,
      });

      const payloadText = await res.text().catch(() => "");
      let payload: any = {};
      try {
        payload = payloadText ? JSON.parse(payloadText) : {};
      } catch {
        payload = { raw: payloadText };
      }

      if (!res.ok) {
        throw new Error(
          payload?.error ||
            `Failed to post story (${res.status}). ${payloadText?.slice(0, 150)}`
        );
      }

      setSuccessMsg("Story posted successfully ✅");
      resetForm();
      await fetchStories();
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to post story");
    } finally {
      setPosting(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ padding: 24, color: "#e5e7eb" }}>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "#e5e7eb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              Echoes Of Nepal — Stories
            </h1>
            <p style={{ color: "#9ca3af", marginTop: 0 }}>
              Share your journey. Explore stories from everyone.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: "#9ca3af", fontSize: 13 }}>{user?.email}</div>

            <button
              onClick={logout}
              style={{
                marginTop: 10,
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#e5e7eb",
                padding: "8px 12px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Create story card */}
        <div
          className="eon-auth-card"
          style={{ marginTop: 18, maxWidth: "100%", padding: 18 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Create a story
          </h2>
          <p style={{ color: "#9ca3af", marginTop: 0, marginBottom: 12 }}>
            Share your journey — photos, videos, and a short caption.
          </p>

          {errorMsg && (
            <div
              style={{
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.35)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                color: "#fecaca",
                fontWeight: 700,
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.30)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                color: "#bbf7d0",
                fontWeight: 700,
              }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={postStory} className="eon-form" style={{ gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <label>
                <span>Story title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Snowfall near Shivapuri"
                  required
                />
              </label>

              <label>
                <span>Location tag</span>
                <input
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="Shivapuri"
                />
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about your journey..."
                rows={4}
                style={{
                  borderRadius: 14,
                  border: "1px solid #4b5563",
                  padding: "10px 12px",
                  background: "rgba(15,23,42,0.95)",
                  color: "#e5e7eb",
                  outline: "none",
                }}
              />
            </label>

            <label>
              <span>Media (max 6)</span>
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={onFilesChange}
              />

              <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
                Selected: {files.length} / 6
              </div>
            </label>

            <button
              type="submit"
              className="eon-submit-btn"
              disabled={posting}
              style={{ width: 180, alignSelf: "flex-end" }}
            >
              {posting ? "Posting..." : "Post story"}
            </button>
          </form>
        </div>

        {/* Stories list */}
        <div
          className="eon-auth-card"
          style={{ marginTop: 18, maxWidth: "100%", padding: 18 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                Latest stories
              </h2>
              <p style={{ color: "#9ca3af", marginTop: 0 }}>
                Explore stories from everyone.
              </p>
            </div>

            <button
              onClick={fetchStories}
              style={{
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#e5e7eb",
                padding: "8px 12px",
                borderRadius: 10,
                cursor: "pointer",
              }}
              disabled={fetchingStories}
            >
              {fetchingStories ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {fetchingStories ? (
            <p style={{ color: "#9ca3af" }}>Loading stories…</p>
          ) : stories.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>No stories yet. Post the first one 👀</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {stories.map((s, idx) => {
                const key = String(s.id || idx);
                const when = s.created_at;

                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid rgba(148,163,184,0.25)",
                      borderRadius: 14,
                      padding: 14,
                      background: "rgba(2,6,23,0.30)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>
                          {s.title}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
                          {s.location_tag ? `📍 ${s.location_tag}` : ""}
                          {s.location_tag && when ? " • " : ""}
                          {when ? new Date(when).toLocaleString() : ""}
                        </div>
                      </div>

                      <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#e5e7eb" }}>
                          {s.user?.name || "Unknown"}
                        </div>
                        <div>{s.user?.email || ""}</div>
                      </div>
                    </div>

                    {s.description && (
                      <p style={{ marginTop: 10, color: "#e5e7eb" }}>
                        {s.description}
                      </p>
                    )}

                    {Array.isArray(s.media) && s.media.length > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        {s.media.slice(0, 6).map((m, i) => {
                          const rawUrl = m.media_url || "";
                          const url = resolveMediaUrl(rawUrl);
                          const type = m.media_type || "";

                          if (!url) return null;

                          const isVideo =
                            type === "video" || /\.(mp4|webm|mov)$/i.test(url);

                          return isVideo ? (
                            <video
                              key={i}
                              src={url}
                              controls
                              style={{ width: 220, borderRadius: 12 }}
                            />
                          ) : (
                            <img
                              key={i}
                              src={url}
                              alt="story media"
                              style={{
                                width: 220,
                                height: 160,
                                borderRadius: 12,
                                objectFit: "cover",
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
