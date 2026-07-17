import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Star, MessageCircle, Eye, ArrowRight, Plus, Images, Layers,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [products, clicks, testimonials, lookbook, collections] = await Promise.all([
        supabase.from("products").select("id,name,featured,available,images,updated_at").order("updated_at", { ascending: false }),
        supabase.from("whatsapp_clicks").select("id,product_name,created_at").order("created_at", { ascending: false }),
        supabase.from("testimonials").select("id"),
        supabase.from("lookbook_images").select("id,image,title,created_at").order("created_at", { ascending: false }),
        supabase.from("collections").select("id"),
      ]);
      const p = products.data ?? [];
      const c = clicks.data ?? [];
      const weekAgo = Date.now() - 7 * 864e5;
      return {
        products: p,
        totalProducts: p.length,
        featured: p.filter((x: any) => x.featured).length,
        available: p.filter((x: any) => x.available).length,
        collections: collections.data?.length ?? 0,
        testimonials: testimonials.data?.length ?? 0,
        lookbook: lookbook.data ?? [],
        clicksTotal: c.length,
        clicksWeek: c.filter((x: any) => new Date(x.created_at).getTime() > weekAgo).length,
        recentClicks: c.slice(0, 6),
      };
    },
  });

  const kpis = [
    { label: "Products", value: data?.totalProducts ?? 0, hint: `${data?.available ?? 0} live`, icon: ShoppingBag },
    { label: "Featured", value: data?.featured ?? 0, hint: "on homepage", icon: Star },
    { label: "WhatsApp clicks", value: data?.clicksTotal ?? 0, hint: `${data?.clicksWeek ?? 0} this week`, icon: MessageCircle },
    { label: "Collections", value: data?.collections ?? 0, hint: `${data?.testimonials ?? 0} testimonials`, icon: Layers },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Overview</p>
        <h1 className="mt-2 font-serif text-[32px] leading-tight text-neutral-900">Good day, Maison Mayve.</h1>
        <p className="mt-2 text-sm text-neutral-600">A snapshot of your catalogue and customer inquiries.</p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-neutral-200/70 p-6">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-full bg-[#f5efe6] grid place-items-center">
                  <Icon size={16} className="text-[#a88356]" strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-6 text-[30px] font-serif text-neutral-900 leading-none tabular-nums">{k.value}</div>
              <div className="mt-2.5 text-[13px] font-medium text-neutral-800">{k.label}</div>
              <div className="text-[12px] text-neutral-500 mt-0.5">{k.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions + recent inquiries */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden">
          <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900">RECENT WHATSAPP INQUIRIES</div>
              <div className="text-[12px] text-neutral-500 mt-1">Latest customer clicks from the site</div>
            </div>
            <Link to="/admin/analytics" className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 hover:text-neutral-900">
              ANALYTICS <ArrowRight size={11} />
            </Link>
          </header>
          {data?.recentClicks.length ? (
            <ul className="divide-y divide-neutral-100">
              {data.recentClicks.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between px-6 py-3.5 text-[13px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 grid place-items-center shrink-0">
                      <MessageCircle size={13} className="text-emerald-700" />
                    </div>
                    <span className="text-neutral-900 font-medium truncate">{c.product_name || "General inquiry"}</span>
                  </div>
                  <span className="text-[12px] text-neutral-500 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-14 text-center text-[13px] text-neutral-500">
              No inquiries yet. Customers who tap WhatsApp on the site will appear here.
            </div>
          )}
        </section>

        <aside className="bg-[#0a0a0a] text-white rounded-2xl p-6">
          <div className="text-[11px] font-semibold tracking-[0.28em] text-white/80">QUICK ACTIONS</div>
          <div className="mt-6 space-y-2.5">
            <Link to="/admin/products" className="flex items-center justify-center gap-2 rounded-lg bg-[#c9a67a] hover:bg-[#b8955f] text-neutral-900 text-[13px] font-semibold py-2.5 transition">
              <Plus size={14} strokeWidth={2.5} /> Add product
            </Link>
            <Link to="/admin/lookbook" className="flex items-center justify-center gap-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              <Images size={13} /> Upload lookbook
            </Link>
            <Link to="/admin/content" className="block text-center rounded-lg bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              Edit homepage
            </Link>
            <Link to="/admin/whatsapp" className="block text-center rounded-lg bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              WhatsApp settings
            </Link>
          </div>
        </aside>
      </div>

      {/* Featured products preview */}
      <section className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <header className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900">FEATURED PIECES</div>
            <div className="text-[12px] text-neutral-500 mt-1">Currently spotlighted on the homepage</div>
          </div>
          <Link to="/admin/products" className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
            MANAGE <ArrowRight size={11} />
          </Link>
        </header>
        {data?.products.filter((p: any) => p.featured).length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.products.filter((p: any) => p.featured).slice(0, 6).map((p: any) => (
              <div key={p.id} className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden relative group">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-[11px] text-white font-medium truncate">{p.name}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-[13px] text-neutral-500">
            No featured products yet. Toggle "Featured" on any product to spotlight it here.
          </div>
        )}
      </section>

      {/* Recent lookbook */}
      {data?.lookbook.length ? (
        <section className="bg-white rounded-2xl border border-neutral-200/70 p-6">
          <header className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900">FROM THE LOOKBOOK</div>
              <div className="text-[12px] text-neutral-500 mt-1">Most recent additions</div>
            </div>
            <Link to="/admin/lookbook" className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
              VIEW ALL <ArrowRight size={11} />
            </Link>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.lookbook.slice(0, 4).map((l: any) => (
              <div key={l.id} className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden">
                <img src={l.image} alt={l.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
