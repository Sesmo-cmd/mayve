import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";

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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-[#0b0b0c] text-white overflow-hidden">
      {/* Subtle decorative backdrop */}
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none"
           style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 40%)" }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.22em] text-white/60">
            <ShieldCheck size={11} /> Secure Portal
          </div>
          <h1 className="mt-5 font-serif text-4xl tracking-tight">Mayve</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-white/40">Administration</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white text-neutral-900 shadow-2xl shadow-black/40 border border-white/10 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight">
              {mode === "signin" ? "Sign in to continue" : "Create admin account"}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {mode === "signin"
                ? "Enter your credentials to access the dashboard."
                : "Provision the platform owner account."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@mayve.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>
            </div>

            {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
            {info && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{info}</div>}

            <button
              disabled={busy}
              className="group w-full inline-flex items-center justify-center gap-2 bg-neutral-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-60 transition"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              {!busy && <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            {mode === "signin" ? (
              <button onClick={() => setMode("signup")} className="hover:text-neutral-900 underline underline-offset-2">
                First time? Create the admin account
              </button>
            ) : (
              <button onClick={() => setMode("signin")} className="hover:text-neutral-900 underline underline-offset-2">
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/40 leading-relaxed">
          Only one admin account can exist. After the first signup, registration is locked.
        </p>
      </div>
    </div>
  );
}
