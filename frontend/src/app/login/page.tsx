"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // If already logged in, send user to home
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // ---------------- GOOGLE LOGIN ----------------
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

      // ✅ use AuthProvider instead of manual localStorage
      loginWithToken(data.token);
      router.push("/");
    } catch (err) {
      console.error("Google login error", err);
      alert("Something went wrong with Google login");
    }
  };

  const handleScriptLoad = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      {
        theme: "outline",
        size: "large",
        width: 280,
      }
    );
  };

  // ---------------- EMAIL LOGIN ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // ✅ use AuthProvider
      loginWithToken(data.token);
      router.push("/");
    } catch (err) {
      console.error("Login error", err);
      alert("Something went wrong while logging in");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EMAIL REGISTER ----------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

      // ✅ auto-login after register
      loginWithToken(data.token);
      router.push("/");
    } catch (err) {
      console.error("Register error", err);
      alert("Something went wrong while creating your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={handleScriptLoad}
      />

      <div className="eon-auth-root">
        {/* LEFT SIDE – mountain hero */}
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
              Save routes, stories and hidden spots across the Himalayas.
              One account for all your rides, treks and adventures.
            </p>
            <ul className="eon-points">
              <li>AI-powered route ideas inside Nepal</li>
              <li>Save your favorite rides &amp; trails</li>
              <li>Plan treks, stays and local experiences</li>
            </ul>
          </div>
        </section>

        {/* RIGHT SIDE – auth card */}
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
                  activeTab === "login"
                    ? "eon-tab eon-tab-active"
                    : "eon-tab"
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
                      required
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Login"}
                  </button>
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
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Create account"}
                  </button>
                </form>
              )}
            </div>

            {/* GOOGLE under forms */}
            <div className="eon-google-block">
              <div className="eon-divider">
                <span>OR CONTINUE WITH</span>
              </div>
              <div id="googleSignInDiv" className="eon-google-btn">
                {/* Google renders the button here; fallback text if not loaded */}
                <span className="eon-google-fallback">
                  Google sign-in loading…
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
