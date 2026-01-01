"use client";

import { useState } from "react";

const API = "http://localhost:5000";

export default function StoryComposer({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setPosting(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("location_tag", locationTag);

      if (files) {
        const max = Math.min(files.length, 6);
        for (let i = 0; i < max; i++) form.append("media", files[i]);
      }

      const res = await fetch(`${API}/api/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to post story");
        return;
      }

      setTitle("");
      setDescription("");
      setLocationTag("");
      setFiles(null);

      onPosted();
      alert("Story posted ✅");
    } catch (e) {
      console.error(e);
      alert("Something went wrong posting story");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="eon-dash-card">
      <h2 className="eon-card-title">Create a story</h2>

      <div className="eon-form-grid">
        <input
          className="eon-input2"
          placeholder="Story title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="eon-input2"
          placeholder="Location tag (e.g., Mustang, Rara, Pokhara)"
          value={locationTag}
          onChange={(e) => setLocationTag(e.target.value)}
        />

        <textarea
          className="eon-textarea"
          placeholder="Write something about your journey..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="eon-upload-row">
          <input
            className="eon-file"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setFiles(e.target.files)}
          />

          <button className="eon-submit2" onClick={submit} disabled={posting}>
            {posting ? "Posting..." : "Post story"}
          </button>
        </div>

        <p className="eon-hint">Max 6 files. Images + videos supported.</p>
      </div>
    </section>
  );
}
