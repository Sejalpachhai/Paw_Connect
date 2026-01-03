"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000";

type Media = { id: number; media_url: string; media_type: "image" | "video" };

type Story = {
  id: number;
  title: string;
  description: string;
  location_tag: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  media: Media[];
};

export default function StoryFeed({ refreshKey }: { refreshKey: number }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/stories`);
      const data = await res.json();
      setStories(data.stories || []);
    } catch (e) {
      console.error(e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="eon-dash-card">
        <p className="eon-dash-muted">Loading stories…</p>
      </section>
    );
  }

  return (
    <section className="eon-dash-card">
      <h2 className="eon-card-title">Latest stories</h2>

      {stories.length === 0 ? (
        <p className="eon-dash-muted">No stories yet. Post the first one 👀</p>
      ) : (
        <div className="eon-feed">
          {stories.map((s) => (
            <article key={s.id} className="eon-story">
              <div className="eon-story-head">
                <div>
                  <p className="eon-story-user">{s.user_name || "Traveler"}</p>
                  <p className="eon-story-meta">
                    {s.location_tag ? `📍 ${s.location_tag} • ` : ""}
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="eon-story-title">{s.title}</h3>

              {s.description ? (
                <p className="eon-story-desc">{s.description}</p>
              ) : null}

              {s.media?.length ? (
                <div className="eon-media-grid">
                  {s.media.map((m) =>
                    m.media_type === "video" ? (
                      <video
                        key={m.id}
                        className="eon-media"
                        controls
                        src={`${API}${m.media_url}`}
                      />
                    ) : (
                      <img
                        key={m.id}
                        className="eon-media"
                        src={`${API}${m.media_url}`}
                        alt="Story media"
                      />
                    )
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
