import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight } from "lucide-react";

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
    setErr(null);
    setInfo(null);
    setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) {
      setErr(error);
      return;
    }
    if (mode === "signup") setInfo("Account created. You may now sign in.");
  }

  return (
    <div className="admin-shell min-h-screen flex items-center justify-center bg-[#f5f1ea] text-neutral-900 px-6 py-16">
      <section className="w-full flex items-center justify-center">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[11px] tracking-[0.42em] font-medium text-neutral-700">MAYVE</span>
            <span className="h-px w-6 bg-neutral-300" />
            <span className="text-[10px] tracking-[0.32em] text-neutral-400">STUDIO ADMIN</span>
          </div>



          <p className="text-[10px] uppercase tracking-[0.36em] text-neutral-400 mb-4">
            {mode === "signin" ? "Sign in" : "Sign up"}
          </p>
          <h1 className="font-serif text-[34px] leading-[1.1] tracking-tight text-neutral-900">
            {mode === "signin" ? "Welcome back." : "Sign up to your workspace."}
          </h1>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.24em] text-neutral-500 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@mayve.com"
                className="w-full bg-transparent border-0 border-b border-neutral-300 px-0 py-2.5 text-[15px] placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-[0.24em] text-neutral-500">Password</label>
                {mode === "signin" && (
                  <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Min 6 chars</span>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-0 border-b border-neutral-300 px-0 py-2.5 text-[15px] placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition"
              />
            </div>

            {err && (
              <div className="text-[12px] text-red-700 bg-red-50/70 border-l-2 border-red-500 px-3 py-2">
                {err}
              </div>
            )}
            {info && (
              <div className="text-[12px] text-emerald-800 bg-emerald-50/70 border-l-2 border-emerald-600 px-3 py-2">
                {info}
              </div>
            )}

            <button
              disabled={busy}
              className="group mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#0a0a0a] text-white py-3.5 text-[12px] uppercase tracking-[0.28em] font-medium hover:bg-neutral-800 disabled:opacity-60 transition"
            >
              {busy ? "Please wait" : mode === "signin" ? "Enter workspace" : "Create account"}
              {!busy && <ArrowRight size={13} className="transition group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="uppercase tracking-[0.22em] text-neutral-400">
              {mode === "signin" ? "First time" : "Have access"}
            </span>
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-neutral-900 hover:text-[#8a6d3f] transition tracking-wide"
            >
              {mode === "signin" ? "Provision account →" : "Sign in instead →"}
            </button>
          </div>

          <p className="mt-8 text-[10.5px] text-neutral-400 leading-relaxed tracking-wide">
            A single administrator account governs this workspace. Registration closes after the first signup.
          </p>
        </div>
      </section>
    </div>
  );
}
