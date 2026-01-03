"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    if (!email || !token) {
      alert("Invalid or missing reset link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not reset password");
        return;
      }

      alert("Password updated! You can now log in with your new password.");
      router.push("/login");
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Something went wrong while resetting your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eon-auth-root">
      {/* reuse hero on the left */}
      <section className="eon-auth-hero">
        <div className="eon-auth-hero-overlay" />
        <div className="eon-auth-hero-content">
          <p className="eon-pill">ECHOES OF NEPAL</p>
          <h1>Reset your password</h1>
          <p className="eon-sub">
            Choose a strong new password to keep your journeys safe.
          </p>
        </div>
      </section>

      <section className="eon-auth-panel">
        <div className="eon-auth-card">
          <header className="eon-auth-header">
            <h2>Create a new password</h2>
            <p>For: {email || "your account"}</p>
          </header>

          <div className="eon-form-wrapper">
            <form className="eon-form" onSubmit={handleReset}>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </button>
              <p className="eon-helper">
                After updating, you’ll be redirected back to the login page.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
