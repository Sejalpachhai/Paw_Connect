"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { Eye, EyeOff } from "lucide-react";

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

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Google init guards
  const googleInitializedRef = useRef(false);
  const googleButtonRenderedRef = useRef(false);

  // If already logged in, go dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Reset password redirect if token/email exists
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

  // ---------- GOOGLE LOGIN ----------
  const handleCredentialResponse = async (response: any) => {
    try {
      const idToken = response.credential;

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Google authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Google login error", err);
      alert("Something went wrong with Google login");
    }
  };

  const renderGoogleButton = () => {
    if (!window.google) return;

    // Initialize once
    if (!googleInitializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      googleInitializedRef.current = true;
    }

    const el = document.getElementById("googleSignInDiv");
    if (!el) return;

    // Re-render safely if needed
    el.innerHTML = "";
    window.google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      width: 320,
    });

    googleButtonRenderedRef.current = true;
  };

  const handleScriptLoad = () => {
    renderGoogleButton();
  };

  // If user switches tabs or component updates, ensure button stays rendered
  useEffect(() => {
    // slight delay so DOM is ready
    const t = setTimeout(() => {
      if (window.google) renderGoogleButton();
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- EMAIL LOGIN ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      alert("Something went wrong while logging in");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- EMAIL REGISTER ----------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Account created! Please check your email to verify your account.");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } catch (err) {
      console.error("Register error", err);
      alert("Something went wrong while creating your account");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading UI
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
        onLoad={handleScriptLoad}
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
              Save routes, stories and hidden spots across the Himalayas. One
              account for all your rides, treks and adventures.
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
            <div className="eon-auth-tabs">
              <button
                type="button"
                className={
                  activeTab === "login" ? "eon-tab eon-tab-active" : "eon-tab"
                }
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={
                  activeTab === "register"
                    ? "eon-tab eon-tab-active"
                    : "eon-tab"
                }
                onClick={() => setActiveTab("register")}
              >
                Create account
              </button>
            </div>

            {/* Forms */}
            <div className="eon-form-wrapper">
              {activeTab === "login" ? (
                <form className="eon-form" onSubmit={handleLogin}>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    <span>Password</span>

                    <div className="eon-input-wrap">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="eon-input eon-input-has-icon"
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        className="eon-icon-btn"
                        aria-label={
                          showLoginPassword ? "Hide password" : "Show password"
                        }
                        title={showLoginPassword ? "Hide" : "Show"}
                      >
                        {showLoginPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="eon-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Please wait..." : "Login"}
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
                      placeholder="Your name"
                      required
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
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
                      />

                      <button
                        type="button"
                        onClick={() => setShowRegPassword((p) => !p)}
                        className="eon-icon-btn"
                        aria-label={
                          showRegPassword ? "Hide password" : "Show password"
                        }
                        title={showRegPassword ? "Hide" : "Show"}
                      >
                        {showRegPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="eon-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Please wait..." : "Create account"}
                  </button>

                  <p className="eon-helper">
                    After creating an account, please verify your email before
                    logging in.
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

            <div id="googleSignInDiv" className="eon-google-under">
              {/* fallback text only if Google doesn't render */}
              <span className="eon-google-fallback">Sign in with Google</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
