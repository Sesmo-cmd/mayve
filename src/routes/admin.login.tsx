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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-serif tracking-wide">Mayve</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-1">Admin Portal</div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-700">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          {err && <div className="text-xs text-red-600">{err}</div>}
          {info && <div className="text-xs text-green-700">{info}</div>}
          <button
            disabled={busy}
            className="w-full bg-neutral-900 text-white py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create admin account"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-neutral-500">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="underline">First time? Create the admin account</button>
          ) : (
            <button onClick={() => setMode("signin")} className="underline">Already have an account? Sign in</button>
          )}
        </div>
        <p className="mt-4 text-[11px] text-neutral-400 text-center leading-relaxed">
          Only one admin account can exist. After the first signup, registration is locked.
        </p>
      </div>
    </div>
  );
}
