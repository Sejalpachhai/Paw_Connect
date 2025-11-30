"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect this page – if not logged in, send to /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || (!user && typeof window !== "undefined")) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-300">
          Loading your Echoes Of Nepal dashboard…
        </p>
      </main>
    );
  }

  if (!user) {
    // redirecting…
    return null;
  }

  const firstName = user.name?.split(" ")[0] || "Traveler";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-800 bg-slate-950/80">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-orange-500/90 flex items-center justify-center text-xs font-bold tracking-tight shadow-lg shadow-orange-500/40">
            EON
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Echoes Of Nepal</p>
            <p className="text-[11px] text-slate-400">
              Routes • Rides • Stories
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <p className="px-3 text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
            Overview
          </p>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-50 text-sm">
            <span>🏔</span>
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900/80">
            <span>🗺</span>
            <span>My routes</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900/80">
            <span>⭐</span>
            <span>Saved places</span>
          </button>

          <p className="px-3 mt-4 text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
            Trips
          </p>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900/80">
            <span>🧭</span>
            <span>Plan new trip</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900/80">
            <span>📅</span>
            <span>Upcoming journeys</span>
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <p className="mb-1 font-medium text-slate-200">
            {firstName}&apos;s account
          </p>
          <p className="truncate text-[11px]">{user.email}</p>
        </div>
      </aside>

      {/* Main content area */}
      <section className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/80 backdrop-blur">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.18em] text-orange-400">
              Dashboard
            </span>
            <span className="text-sm text-slate-300">
              Namaste, {firstName}. Ready for your next journey?
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
              <span>+</span>
              <span>New trip</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 text-xs font-semibold flex items-center justify-center text-slate-950">
              {firstName[0]?.toUpperCase() || "T"}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.06),_transparent_55%),_linear-gradient(to_bottom,_#020617,_#020617)]">
          {/* Top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Next recommended escape
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  Weekend loop around Nagarkot & Dhulikhel
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Curvy roads, sunrise viewpoints and tea stops.
                </p>
              </div>
              <button className="mt-3 self-start text-[11px] px-3 py-1.5 rounded-full bg-orange-500 text-slate-950 font-medium hover:bg-orange-400">
                View suggestion
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400 mb-1">
                This month&apos;s activity
              </p>
              <p className="text-2xl font-semibold text-slate-50 mb-1">
                4 rides
              </p>
              <p className="text-xs text-slate-400">
                You explored approx. <span className="font-medium">327 km</span>{" "}
                of Nepali roads. Keep the wheels moving.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400 mb-1">Saved spots</p>
              <p className="text-2xl font-semibold text-slate-50 mb-1">
                9 places
              </p>
              <p className="text-xs text-slate-400">
                Your map is starting to look like a constellation.
              </p>
            </div>
          </div>

          {/* Middle section: map + AI suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map placeholder */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-400">Your routes</p>
                  <p className="text-sm font-medium text-slate-50">
                    Recently explored in Nepal
                  </p>
                </div>
                <button className="text-[11px] px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-200">
                  Open full map
                </button>
              </div>

              <div className="flex-1 rounded-xl border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.08),_transparent_60%),_linear-gradient(135deg,_#020617,_#020617)] flex items-center justify-center text-xs text-slate-400">
                <div className="text-center px-6">
                  <p className="mb-2">
                    🗺 Interactive trip map coming soon.
                  </p>
                  <p>
                    For now, this area will preview your planned routes and
                    completed journeys.
                  </p>
                </div>
              </div>
            </div>

            {/* AI helper card */}
            <div className="rounded-2xl border border-orange-500/50 bg-slate-900/80 p-4 flex flex-col">
              <p className="text-xs text-orange-300 mb-1">Echoes AI guide</p>
              <p className="text-sm font-semibold text-slate-50 mb-2">
                Ask for a custom route inside Nepal
              </p>
              <p className="text-xs text-slate-300 mb-3">
                Tell Echoes AI how many days you have, your bike or trek level,
                and it will suggest a route.
              </p>
              <textarea
                className="min-h-[80px] rounded-xl border border-slate-700 bg-slate-950/70 text-xs text-slate-100 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
                placeholder="Example: 3 days, intermediate rider, starting from Kathmandu, want a mix of highway and light off-road with mountain views."
              />
              <button className="mt-3 w-full text-[11px] px-3 py-2 rounded-full bg-orange-500 text-slate-950 font-medium hover:bg-orange-400">
                Generate route idea
              </button>
            </div>
          </div>

          {/* Bottom section: upcoming trips + recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upcoming trips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-50">
                  Upcoming journeys
                </p>
                <button className="text-[11px] text-slate-300 hover:text-slate-100">
                  View all
                </button>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-50">
                      Manang – Weekend escape
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tentative · Next month · 3 days
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-200">
                    Draft
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-50">
                      Kathmandu valley sunset loop
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Saturday · 1 day · Easy pace
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                    Planned
                  </span>
                </li>
              </ul>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-50">
                  Recent activity
                </p>
                <button className="text-[11px] text-slate-300 hover:text-slate-100">
                  View log
                </button>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-50">
                      Added &quot;Kalinchowk snow ride&quot; to saved routes
                    </p>
                    <p className="text-[11px] text-slate-400">
                      2 hours ago · Distance: 160 km
                    </p>
                  </div>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-50">
                      Marked &quot;Mailung waterfall loop&quot; as completed
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Yesterday · Mixed off-road
                    </p>
                  </div>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-50">
                      Saved &quot;Pokhara lakeside evening walk&quot;
                    </p>
                    <p className="text-[11px] text-slate-400">
                      3 days ago · Easy walk
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
