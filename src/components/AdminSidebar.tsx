import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Boxes, ClipboardList, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const { signOut, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-50 bg-neutral-900 text-white p-2 rounded"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-neutral-950 text-neutral-100 flex flex-col z-40 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 border-b border-neutral-800">
          <div className="text-xl font-serif tracking-wide">Mayve</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-1">Admin</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                  active ? "bg-white text-neutral-900" : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon size={16} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-neutral-800 px-4 py-4 text-xs">
          <div className="text-neutral-500 truncate mb-2">{user?.email}</div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-neutral-300 hover:text-white"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
