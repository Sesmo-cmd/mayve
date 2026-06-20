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
    return <div className="min-h-screen bg-off"><Outlet /></div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-off text-sm text-muted">Loading…</div>;
  }

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-sm text-neutral-600 mt-2">Your account does not have admin access.</p>
          <Link to="/admin/login" className="inline-block mt-4 text-sm underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <AdminSidebar />
      <main className="flex-1 min-w-0 md:ml-0 p-4 md:p-8 pt-16 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
