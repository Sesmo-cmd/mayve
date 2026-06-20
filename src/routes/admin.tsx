import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Mayve" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { loading, user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) navigate({ to: "/admin/login", replace: true });
  }, [loading, user, isLogin, navigate]);

  if (isLogin) {
    return <div className="min-h-screen bg-cream"><Outlet /></div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-sm text-muted">Loading…</div>;
  }

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off px-4">
        <div className="max-w-sm text-center bg-white border border-sand rounded-sm p-8 shadow-[0_20px_60px_-24px_rgba(13,13,13,0.12)]">
          <h1 className="text-xl font-serif font-bold text-black">Access denied</h1>
          <p className="text-sm text-muted mt-2">Your account does not have admin access.</p>
          <Link to="/admin/login" className="inline-block mt-4 text-sm underline text-muted hover:text-warm">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-off text-text">
      <AdminSidebar />
      <main className="flex-1 min-w-0 md:ml-0 p-4 md:p-8 pt-16 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
