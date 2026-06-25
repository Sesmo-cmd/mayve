import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ShieldCheck, ArrowRight, Infinity as InfinityIcon } from "lucide-react";

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
    if (mode === "signup") setInfo("Account created. You may now sign in.");
  }

  return (
    <div className="min-h-screen flex bg-[#f4f4f6]">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30"
             style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5), transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08), transparent 50%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2.5">
            <InfinityIcon size={26} className="text-indigo-400" strokeWidth={2.5} />
            <span className="font-semibold tracking-tight text-lg">Mayve</span>
          </div>
          <div className="max-w-md">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/50 mb-4">Administration</p>
            <h2 className="font-serif text-4xl leading-tight">A back-office built for considered fashion.</h2>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Manage products, inventory, customers, and analytics from a single
              private workspace — connected directly to your storefront.
            </p>
          </div>
          <div className="text-[11px] text-white/40 uppercase tracking-[0.22em]">© Mayve — Secure Portal</div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <InfinityIcon size={22} className="text-indigo-600" strokeWidth={2.5} />
            <span className="font-semibold tracking-tight">Mayve</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-[0.18em] font-medium">
            <ShieldCheck size={11} /> Secure Portal
          </div>
          <h1 className="mt-5 text-[26px] font-semibold tracking-tight text-neutral-900">
            {mode === "signin" ? "Sign in to Mayve" : "Create admin account"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {mode === "signin"
              ? "Enter your credentials to access the dashboard."
              : "Provision the platform owner account."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@mayve.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
            {info && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{info}</div>}

            <button
              disabled={busy}
              className="group w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              {!busy && <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            {mode === "signin" ? (
              <button onClick={() => setMode("signup")} className="hover:text-indigo-700 underline underline-offset-2">
                First time? Create the admin account
              </button>
            ) : (
              <button onClick={() => setMode("signin")} className="hover:text-indigo-700 underline underline-offset-2">
                Already have an account? Sign in
              </button>
            )}
          </div>

          <p className="mt-10 text-center text-[11px] text-neutral-400 leading-relaxed">
            Only one admin account can exist. After the first signup, registration is locked.
          </p>
        </div>
      </div>
    </div>
  );
}
