import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const { signOut, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const initials = (user?.email ?? "A").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-[#0b0b0c] text-white px-4 h-14 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-white text-[#0b0b0c] grid place-items-center text-xs font-bold tracking-wide">M</div>
          <div className="text-sm font-serif tracking-wide">Mayve <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] ml-1">Admin</span></div>
        </div>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation" className="p-2 -mr-2">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-[#0b0b0c] text-neutral-200 flex flex-col border-r border-white/5 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white text-[#0b0b0c] grid place-items-center font-bold">M</div>
            <div>
              <div className="font-serif text-lg leading-none tracking-wide text-white">Mayve</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">Administration</div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 mx-5" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
            Workspace
          </div>
          <ul className="space-y-0.5">
            {items.map((it) => {
              const active =
                pathname === it.to || pathname.startsWith(it.to + "/");
              const Icon = it.icon;
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-white" />
                    )}
                    <Icon size={16} className={active ? "text-white" : "text-neutral-500 group-hover:text-white"} />
                    <span className="font-medium">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500 text-[#0b0b0c] grid place-items-center text-[11px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{user?.email ?? "Admin"}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-[0.18em]">Owner</div>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
