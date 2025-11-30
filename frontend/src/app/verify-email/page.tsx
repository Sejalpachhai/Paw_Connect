"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login…");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          padding: "2rem",
          background: "rgba(15,23,42,0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        {status === "loading" && (
          <>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
              Verifying your email…
            </h2>
            <p>Please wait while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 style={{ fontSize: "1.4rem", color: "#4ade80" }}>
              Email Verified 🎉
            </h2>
            <p>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ fontSize: "1.4rem", color: "#f87171" }}>
              Verification Failed ❌
            </h2>
            <p>{message}</p>
            <button
              onClick={() => router.push("/login")}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#fb923c",
                borderRadius: "8px",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
