import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin/dashboard", replace: true });
  }, [user, isAdmin, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setInfo(null); setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) { setErr(error); return; }
    if (mode === "signup") setInfo("Account created. Check your email if confirmation is required, then sign in.");
  }

  return (
    <div className="min-h-screen bg-off flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-white border border-sand rounded-sm p-8 md:p-10 shadow-[0_20px_60px_-24px_rgba(13,13,13,0.12)]">
        <div className="text-center mb-8">
          <div className="font-serif text-3xl font-bold tracking-[0.12em] text-black uppercase">Mayve</div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted mt-2">Admin Portal</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-[0.08em] uppercase text-text">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-sand bg-white rounded-sm px-4 py-3 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm transition-colors"
              placeholder="admin@mayve.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-[0.08em] uppercase text-text">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sand bg-white rounded-sm px-4 py-3 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm transition-colors"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <div className="bg-red-50 border border-red-100 rounded-sm px-4 py-3 text-xs text-red-700 leading-relaxed">
              {err}
            </div>
          )}
          {info && (
            <div className="bg-green-50 border border-green-100 rounded-sm px-4 py-3 text-xs text-green-700 leading-relaxed">
              {info}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full bg-black text-white py-3.5 rounded-sm text-xs font-semibold tracking-[0.14em] uppercase hover:bg-warm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create admin account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-muted hover:text-warm underline underline-offset-4 transition-colors"
          >
            {mode === "signin" ? "First time? Create the admin account" : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="mt-6 text-[11px] text-muted/80 text-center leading-relaxed max-w-xs mx-auto">
          Only one admin account can exist. After the first signup, registration is locked.
        </p>
      </div>
    </div>
  );
}

