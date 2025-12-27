"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const primaryAction = () => {
    if (user) router.push("/dashboard");
    else router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-white/15 bg-white/5 grid place-items-center font-semibold">
              E
            </div>
            <span className="font-semibold tracking-tight">
              Echoes of Nepal
            </span>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-200/80 hover:text-white px-3 py-2 rounded-lg"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
              }}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-nepal.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/70 to-slate-900/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] uppercase">
              AI-Powered Travel Platform
            </p>

            <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-tight">
              Discover the Echoes of Nepal
            </h1>

            <p className="mt-4 text-lg text-slate-200/80">
              Your AI-powered travel companion for authentic Himalayan adventures,
              cultural experiences, and meaningful community connections.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={primaryAction}
                className="rounded-xl px-6 py-3 font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                }}
              >
                Start Your Journey
              </button>

              <button
                onClick={() => router.push("/login")}
                className="rounded-xl px-6 py-3 border border-white/15 bg-white/10 hover:bg-white/15"
              >
                Explore Destinations
              </button>
            </div>

            <div className="mt-6 text-sm text-slate-300/70">
              {loading ? (
                "Loading..."
              ) : user ? (
                <>
                  Welcome back,{" "}
                  <span className="text-white font-medium">
                    {user.name}
                  </span>{" "}
                  —{" "}
                  <Link
                    href="/dashboard"
                    className="underline underline-offset-4"
                  >
                    go to dashboard
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Stat value="1000+" label="Travel Stories" />
          <Stat value="500+" label="Verified Vendors" />
          <Stat value="50+" label="Destinations" />
          <Stat value="24/7" label="SOS Support" />
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">
          Why Choose Echoes of Nepal?
        </h2>
        <p className="mt-3 text-center text-slate-200/70 max-w-3xl mx-auto">
          The first integrated tourism platform combining AI recommendations,
          community stories, and verified local businesses.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <Card
            title="AI-Powered Recommendations"
            desc="Personalized travel suggestions based on interests, budget, and season."
          />
          <Card
            title="Community Stories"
            desc="Real stories from travelers exploring Nepal’s mountains and culture."
          />
          <Card
            title="Safety First"
            desc="SOS alerts, offline guides, and emergency contact features."
          />
        </div>
      </section>

      {/* ================= EXPLORE NEPAL ================= */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/explore-nepal.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-xl">
            <h3 className="text-3xl font-semibold">
              Ready to Explore Nepal?
            </h3>
            <p className="mt-3 text-slate-200/80">
              Join thousands of travelers discovering authentic experiences
              while supporting local communities.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-6 rounded-xl px-6 py-3 font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
              }}
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-sm text-slate-300/60 flex justify-between">
          <span>© {new Date().getFullYear()} Echoes of Nepal</span>
          <span>FY Project</span>
        </div>
      </footer>
    </main>
  );
}

/* ---------- Components ---------- */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-center">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-300/70">{label}</div>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-slate-300/70 leading-relaxed">{desc}</p>
    </div>
  );
}
