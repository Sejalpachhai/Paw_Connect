"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
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
        console.error(data);
        alert(data.error || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      alert(`Logged in as ${data.user.name}`);
      console.log("User:", data.user);
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

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={handleScriptLoad}
      />

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Login to Echoes Of Nepal</h1>

        <div id="googleSignInDiv"></div>

        <p>or use email/password (coming soon)</p>
      </main>
    </>
  );
}
