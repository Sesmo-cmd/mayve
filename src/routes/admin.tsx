import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mayve Administration" }, { name: "robots", content: "noindex" }] }),
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

  if (isLogin) return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f4] text-sm text-neutral-500">
        Loading workspace…
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f4] px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-sm text-neutral-600 mt-2">Your account does not have admin access.</p>
          <Link to="/admin/login" className="inline-block mt-4 text-sm underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f4] text-neutral-900 antialiased">
      <AdminSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
