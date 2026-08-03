import { Link, useRouterState } from "@tanstack/react-router";
import {
  LogOut, Menu, X, LayoutDashboard, ShoppingBag, Layers,
  FileText, Images, Quote, MessageCircle, BarChart3, Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import logo from "@/assets/mayve-logo.png.asset.json";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/content", label: "Homepage Content", icon: FileText },
  { to: "/admin/lookbook", label: "Lookbook", icon: Images },
  { to: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { to: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
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
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-[#0a0a0a] px-4 h-14 border-b border-white/10">
        <img src={logo.url} alt="Mayve" className="h-9 w-auto object-contain" />
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
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-[#0a0a0a] text-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-7 pt-8 pb-7">
          <img src={logo.url} alt="Mayve" className="h-14 w-auto object-contain" />
        </div>


        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-0.5">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.to || pathname.startsWith(it.to + "/");
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] transition ${
                      active
                        ? "bg-white/[0.07] text-white font-medium"
                        : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.6} className={active ? "text-[#c9a67a]" : ""} />
                    <span className="flex-1">{it.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[#c9a67a]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] text-white/55 hover:text-white hover:bg-white/[0.04]"
          >
            <LogOut size={15} strokeWidth={1.6} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
