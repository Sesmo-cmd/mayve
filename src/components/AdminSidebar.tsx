import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  Boxes,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const { signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-white px-4 h-14 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <InfinityIcon size={20} className="text-indigo-600" strokeWidth={2.5} />
          <span className="font-semibold tracking-tight">Mayve</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation" className="p-2 -mr-2">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 bg-white flex flex-col border-r border-neutral-200 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <InfinityIcon size={24} className="text-indigo-600" strokeWidth={2.5} />
            <div>
              <div className="text-[17px] font-semibold tracking-tight text-neutral-900 leading-none">Mayve</div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-neutral-400 mt-1">Administration</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {items.map((it) => {
              const active = pathname === it.to || pathname.startsWith(it.to + "/");
              const Icon = it.icon;
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-indigo-600" : "text-neutral-400 group-hover:text-neutral-700"} strokeWidth={2} />
                    <span>{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-neutral-200 p-3">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <LogOut size={17} className="text-neutral-400" strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
