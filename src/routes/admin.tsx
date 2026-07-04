import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Search, Bell, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mayve Administration" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const titleMap: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f6] text-sm text-neutral-500">
        Loading workspace…
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f6] px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-sm text-neutral-600 mt-2">Your account does not have admin access.</p>
          <Link to="/admin/login" className="inline-block mt-4 text-sm underline">Back to login</Link>
        </div>
      </div>
    );
  }

  const title = titleMap[pathname] ?? "Mayve";
  const initials = (user.email ?? "A").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f5f1ea] text-neutral-900 antialiased">
      <AdminSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0 flex flex-col">
        <header className="hidden md:flex items-center justify-end px-8 pt-6">
          <div className="h-9 w-9 rounded-full bg-neutral-900 grid place-items-center text-[11px] font-semibold text-white">
            {initials}
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:px-8 md:pb-10 md:pt-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
{void titleMap;}
