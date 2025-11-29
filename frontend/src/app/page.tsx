"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // If not logged in, send to /login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || (!user && !loading)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading your Echoes Of Nepal profile…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold mb-2">
        Namaste, {user?.name || "traveler"} 👋
      </h1>
      <p className="mb-6 text-slate-300">
        You’re now logged in to Echoes Of Nepal.
      </p>
      <button
        onClick={logout}
        className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
      >
        Logout
      </button>
    </main>
  );
}
