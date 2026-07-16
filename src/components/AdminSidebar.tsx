import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const items = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/settings", label: "Settings" },
] as const;


export function AdminSidebar() {
  const { signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-[#0a0a0a] px-4 h-14 border-b border-white/10">
        <span className="font-semibold tracking-[0.18em] text-white text-sm">MAYVE</span>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation" className="p-2 -mr-2 text-white">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 bg-[#0a0a0a] text-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-7 pt-8 pb-10">
          <div className="text-[22px] font-semibold tracking-[0.22em] leading-none">MAYVE</div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/40 mt-2">Studio Admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-1">
            {items.map((it) => {
              const active = pathname === it.to || pathname.startsWith(it.to + "/");
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-md px-3 py-2.5 text-[13px] transition ${
                      active
                        ? "bg-white/[0.06] text-white font-medium"
                        : "text-white/55 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{it.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[#c9a67a]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-white/55 hover:text-white hover:bg-white/[0.03]"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
