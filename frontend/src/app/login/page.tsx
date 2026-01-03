"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const googleBtnId = useMemo(() => "googleSignInDiv", []);

  // If already logged in, don’t show login page – go to /dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  // If we came here with ?token=... (from reset link), redirect to reset page
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (token && email) {
      router.push(
        `/reset-password?token=${encodeURIComponent(
          token
        )}&email=${encodeURIComponent(email)}`
      );
    }
  }, [searchParams, router]);

  // Clear error when tab changes
  useEffect(() => {
    setErrorMsg("");
  }, [activeTab]);

  // ---------- GOOGLE LOGIN ----------
  const handleCredentialResponse = async (response: any) => {
    try {
      setErrorMsg("");
      const idToken = response?.credential;
      if (!idToken) {
        setErrorMsg("Google login didn’t return a token. Try again.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Google authentication failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Google login error", err);
      setErrorMsg("Something went wrong with Google login.");
    }
  };

  const renderGoogleButton = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const el = document.getElementById(googleBtnId);
      if (!el) return;

      // Important: clear then render (prevents disappearing + duplicates)
      el.innerHTML = "";

      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    } catch (e) {
      console.error("Google button render error", e);
    }
  };

  // Run render again if tab changes (keeps it consistent if DOM changes)
  useEffect(() => {
    // small delay ensures DOM is ready after tab switch
    const t = setTimeout(() => renderGoogleButton(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- EMAIL LOGIN ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Login failed. Check your details.");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setErrorMsg("Something went wrong while logging in.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- EMAIL REGISTER ----------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Registration failed. Try again.");
        return;
      }

      alert("Account created! Please check your email to verify your account.");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } catch (err) {
      console.error("Register error", err);
      setErrorMsg("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  };

  // while we don't know user yet, avoid UI flicker
  if (loading) {
    return (
      <div className="eon-auth-root">
        <section className="eon-auth-hero">
          <div className="eon-auth-hero-overlay" />
        </section>
        <section className="eon-auth-panel">
          <div className="eon-auth-card">
            <p style={{ textAlign: "center" }}>Loading…</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={renderGoogleButton}
      />

      <div className="eon-auth-root">
        {/* LEFT HERO */}
        <section className="eon-auth-hero">
          <div className="eon-auth-hero-overlay" />
          <div className="eon-auth-hero-content">
            <p className="eon-pill">ECHOES OF NEPAL</p>
            <h1>
              Log in and pick up
              <br />
              where your journey paused.
            </h1>
            <p className="eon-sub">
              Save routes, stories and hidden spots across the Himalayas. One account for all your rides,
              treks and adventures.
            </p>
            <ul className="eon-points">
              <li>AI-powered route ideas inside Nepal</li>
              <li>Save your favorite rides &amp; trails</li>
              <li>Plan treks, stays and local experiences</li>
            </ul>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="eon-auth-panel">
          <div className="eon-auth-card">
            <header className="eon-auth-header">
              <h2>Welcome back, traveler</h2>
              <p>Sign in to your Echoes Of Nepal account.</p>
            </header>

            {/* Tabs */}
            <div className="eon-auth-tabs" role="tablist" aria-label="Authentication tabs">
              <button
                type="button"
                className={activeTab === "login" ? "eon-tab eon-tab-active" : "eon-tab"}
                onClick={() => setActiveTab("login")}
                aria-selected={activeTab === "login"}
              >
                Login
              </button>
              <button
                type="button"
                className={activeTab === "register" ? "eon-tab eon-tab-active" : "eon-tab"}
                onClick={() => setActiveTab("register")}
                aria-selected={activeTab === "register"}
              >
                Create account
              </button>
            </div>

            {/* Error */}
            {errorMsg ? (
              <div className="eon-error" role="alert">
                {errorMsg}
              </div>
            ) : null}

            {/* Forms */}
            <div className="eon-form-wrapper">
              {activeTab === "login" ? (
                <form className="eon-form" onSubmit={handleLogin}>
                  {/* Email */}
                  <label>
                    <span>Email</span>
                    <div className="eon-field">
                      <span className="eon-field-icon" aria-hidden="true">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="eon-input eon-input-with-left-icon"
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  {/* Password */}
                  <label>
                    <span>Password</span>
                    <div className="eon-field">
                      <span className="eon-field-icon" aria-hidden="true">
                        <Lock size={16} />
                      </span>

                      <div className="eon-input-wrap">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="eon-input eon-input-with-left-icon eon-input-has-icon"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="eon-icon-btn"
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </label>

                  <button type="submit" className="eon-submit-btn" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                  </button>

                  <div className="eon-helper">
                    <button
                      type="button"
                      className="eon-link-button"
                      onClick={() => router.push("/forgot-password")}
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              ) : (
                <form className="eon-form" onSubmit={handleRegister}>
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    <span>Password</span>
                    <div className="eon-input-wrap">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="eon-input eon-input-has-icon"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="eon-icon-btn"
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <button type="submit" className="eon-submit-btn" disabled={submitting}>
                    {submitting ? "Creating..." : "Create account"}
                  </button>

                  <p className="eon-helper">
                    After creating an account, please verify your email before logging in.
                  </p>
                </form>
              )}
            </div>

            {/* Divider + Google */}
            <div className="eon-divider-row">
              <span className="eon-divider-line" />
              <span className="eon-divider-text">or continue with</span>
              <span className="eon-divider-line" />
            </div>

            <div id={googleBtnId} className="eon-google-under">
              <span className="eon-google-fallback">Sign in with Google</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
