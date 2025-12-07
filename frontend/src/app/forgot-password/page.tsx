"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong while sending reset email");
        return;
      }

      alert("If this email exists, a reset link has been sent.");
      router.push("/login");
    } catch (err) {
      console.error("Forgot password error", err);
      alert("Something went wrong while sending reset email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="eon-auth-root">
      {/* LEFT HERO (reuse same vibes) */}
      <section className="eon-auth-hero">
        <div className="eon-auth-hero-overlay" />
        <div className="eon-auth-hero-content">
          <p className="eon-pill">ECHOES OF NEPAL</p>
          <h1>Let’s help you get back on the trail.</h1>
          <p className="eon-sub">
            Enter your email and we&apos;ll send you a secure link to reset your
            password.
          </p>
          <ul className="eon-points">
            <li>No password is changed without your confirmation.</li>
            <li>Links expire after a short period for security.</li>
          </ul>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="eon-auth-panel">
        <div className="eon-auth-card">
          <header className="eon-auth-header">
            <h2>Forgot your password?</h2>
            <p>We&apos;ll email you a link to reset it.</p>
          </header>

          <div className="eon-form-wrapper">
            <form className="eon-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={submitting}>
                {submitting ? "Sending link…" : "Send reset link"}
              </button>

              <p className="eon-helper">
                Remember your password?{" "}
                <button
                  type="button"
                  className="eon-link-button"
                  onClick={() => router.push("/login")}
                >
                  Back to login
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
