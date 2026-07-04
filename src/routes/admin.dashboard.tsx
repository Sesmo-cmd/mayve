import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Boxes,
  ArrowRight,
  Settings as SettingsIcon,
  TrendingUp,
  DollarSign,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

const statusStyles: Record<string, { dot: string; label: string }> = {
  pending:    { dot: "bg-amber-400",   label: "Pending" },
  processing: { dot: "bg-blue-400",    label: "Processing" },
  confirmed:  { dot: "bg-blue-400",    label: "Confirmed" },
  shipped:    { dot: "bg-violet-400",  label: "Shipped" },
  delivered:  { dot: "bg-emerald-400", label: "Delivered" },
  cancelled:  { dot: "bg-neutral-300", label: "Cancelled" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id,name,stock,available,price,created_at"),
        supabase.from("orders").select("id,customer_name,product_name,status,created_at,product_id").order("created_at", { ascending: false }),
      ]);
      const p = products.data ?? [];
      const o = orders.data ?? [];
      const productPrice = new Map(p.map((x: any) => [x.id, Number(x.price ?? 0)]));
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const days: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString(undefined, { weekday: "short" });
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        const value = o
          .filter((x: any) => {
            const t = new Date(x.created_at).getTime();
            return t >= dayStart && t < dayEnd && x.status !== "cancelled";
          })
          .reduce((s: number, x: any) => s + (productPrice.get(x.product_id) ?? 0), 0);
        days.push({ label: key, value });
      }

      const revenueAll = o
        .filter((x: any) => x.status !== "cancelled")
        .reduce((s: number, x: any) => s + (productPrice.get(x.product_id) ?? 0), 0);

      const weekRevenue = o
        .filter((x: any) => x.status !== "cancelled" && new Date(x.created_at).getTime() > weekAgo)
        .reduce((s: number, x: any) => s + (productPrice.get(x.product_id) ?? 0), 0);

      return {
        total: p.length,
        low: p.filter((x: any) => x.available && x.stock > 0 && x.stock < 3).length,
        out: p.filter((x: any) => !x.available || x.stock === 0).length,
        inStockUnits: p.reduce((s: number, x: any) => s + (x.available ? x.stock : 0), 0),
        ordersAll: o,
        ordersWeekCount: o.filter((x: any) => new Date(x.created_at).getTime() > weekAgo).length,
        pending: o.filter((x: any) => x.status === "pending").length,
        delivered: o.filter((x: any) => x.status === "delivered").length,
        revenueAll,
        weekRevenue,
        days,
        lowStockItems: p
          .filter((x: any) => x.available && x.stock < 3)
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5),
      };
    },
  });

  const recent = data?.ordersAll.slice(0, 5) ?? [];
  const maxDay = Math.max(1, ...(data?.days.map((d) => d.value) ?? [1]));
  const weekTotal = data?.days.reduce((s, d) => s + d.value, 0) ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── KPI row: 2 cols on mobile → 4 on md+ ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Total Revenue"
          value={isLoading ? "—" : formatNaira(data?.revenueAll ?? 0)}
          sub={isLoading ? "" : `${formatNaira(data?.weekRevenue ?? 0)} this week`}
          icon={<DollarSign size={14} strokeWidth={2} />}
          accent="tan"
        />
        <KpiCard
          label="Total Orders"
          value={isLoading ? "—" : String(data?.ordersAll.length ?? 0)}
          sub={isLoading ? "" : `${data?.ordersWeekCount ?? 0} this week`}
          icon={<ClipboardList size={14} strokeWidth={2} />}
          accent="neutral"
        />
        <KpiCard
          label="Products"
          value={isLoading ? "—" : String(data?.total ?? 0)}
          sub={isLoading ? "" : `${data?.inStockUnits ?? 0} units in stock`}
          icon={<Package size={14} strokeWidth={2} />}
          accent="neutral"
        />
        <KpiCard
          label="Pending"
          value={isLoading ? "—" : String(data?.pending ?? 0)}
          sub={isLoading ? "" : `${(data?.low ?? 0) + (data?.out ?? 0)} stock alerts`}
          icon={<AlertTriangle size={14} strokeWidth={2} />}
          accent={(data?.pending ?? 0) > 0 ? "warn" : "neutral"}
        />
      </div>

      {/* ── Middle row: chart full-width on mobile, 2/3 on lg ── */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">

        {/* Revenue chart */}
        <section className="lg:col-span-2 bg-white border border-[#e0d5c5] rounded-2xl p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-[#0d0d0d] tracking-wide uppercase">Revenue</h2>
              <p className="text-[10px] sm:text-[11px] text-[#888078] mt-1">Last 7 days</p>
            </div>
            <div className="text-right">
              <div className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-[#0d0d0d]">{formatNaira(weekTotal)}</div>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <TrendingUp size={10} className="text-[#9b7b52]" />
                <span className="text-[10px] text-[#9b7b52] font-medium">7-day total</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2 h-28 sm:h-36">
            {(data?.days ?? Array(7).fill({ label: "…", value: 0 })).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-[3px] transition-all duration-500"
                    style={{
                      height: `${Math.max(3, (d.value / maxDay) * 100)}%`,
                      background: d.value > 0 ? "linear-gradient(to top, #9b7b52, #c4a882)" : "#e0d5c5",
                    }}
                    title={`₦${d.value.toLocaleString()}`}
                  />
                </div>
                <div className="text-[8px] sm:text-[9px] text-[#888078] uppercase tracking-widest">{d.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions — horizontal pill grid on mobile, vertical card on lg */}
        <aside className="bg-[#0d0d0d] rounded-2xl p-4 sm:p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-[12px] sm:text-[13px] font-semibold text-white tracking-wide uppercase">Quick actions</h2>
            <p className="text-[10px] sm:text-[11px] text-white/30 mt-1">Jump into the work</p>
          </div>
          {/* 2-col grid on mobile, stacked on lg */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:flex lg:flex-col lg:flex-1 lg:justify-center lg:space-y-2.5 lg:gap-0">
            <QA to="/admin/products"  icon={<Plus size={13} strokeWidth={2.5} />} label="Add product"   primary />
            <QA to="/admin/inventory" icon={<Boxes size={13} strokeWidth={2} />}  label="Update stock" />
            <QA to="/admin/orders"    icon={<ShoppingBag size={13} strokeWidth={2} />} label="Log order" />
            <QA to="/admin/settings"  icon={<SettingsIcon size={13} strokeWidth={2} />} label="WhatsApp" />
          </div>
        </aside>
      </div>

      {/* ── Bottom row: orders full-width on mobile/tablet, 2/3 on lg ── */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">

        {/* Recent orders */}
        <section className="lg:col-span-2 bg-white border border-[#e0d5c5] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#f2ede6]">
            <div>
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-[#0d0d0d] tracking-wide uppercase">Recent orders</h2>
              <p className="text-[10px] sm:text-[11px] text-[#888078] mt-0.5 sm:mt-1">Latest WhatsApp sales</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#9b7b52] hover:text-[#0d0d0d] uppercase tracking-widest transition-colors whitespace-nowrap"
            >
              All <ArrowRight size={10} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-4 sm:px-6 py-10 sm:py-14 text-center">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f2ede6] grid place-items-center mb-3 sm:mb-4">
                <ShoppingBag size={16} className="text-[#c4a882]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-[#1a1816]">No orders yet</p>
              <p className="text-xs text-[#888078] mt-1">Log your first WhatsApp sale from Orders.</p>
              <Link to="/admin/orders" className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-medium text-[#9b7b52] uppercase tracking-widest">
                Go to Orders <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-[#f2ede6]">
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#888078]">Customer</th>
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#888078]">Item</th>
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#888078]">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[#888078]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o: any) => {
                      const st = statusStyles[o.status] ?? statusStyles.pending;
                      return (
                        <tr key={o.id} className="border-b border-[#faf8f5] hover:bg-[#faf8f5] transition-colors">
                          <td className="px-6 py-3.5 font-medium text-[#1a1816]">{o.customer_name}</td>
                          <td className="px-6 py-3.5 text-[#888078]">{o.product_name}</td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                              <span className="text-[11px] text-[#888078] capitalize">{st.label}</span>
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right text-[11px] text-[#888078]">{formatDate(o.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list — shown only on mobile */}
              <ul className="sm:hidden divide-y divide-[#f2ede6]">
                {recent.map((o: any) => {
                  const st = statusStyles[o.status] ?? statusStyles.pending;
                  return (
                    <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[#1a1816] truncate">{o.customer_name}</div>
                        <div className="text-[11px] text-[#888078] truncate mt-0.5">{o.product_name}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          <span className="text-[10px] text-[#888078] capitalize">{st.label}</span>
                        </span>
                        <div className="text-[10px] text-[#c4a882] mt-0.5">{formatDate(o.created_at)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* Stock alerts */}
        <aside className="bg-white border border-[#e0d5c5] rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-[#0d0d0d] tracking-wide uppercase">Stock alerts</h2>
              <p className="text-[10px] sm:text-[11px] text-[#888078] mt-0.5 sm:mt-1">Items to restock</p>
            </div>
            <Link to="/admin/inventory" className="text-[10px] sm:text-[11px] font-medium text-[#9b7b52] hover:text-[#0d0d0d] uppercase tracking-widest transition-colors">
              Manage
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#f2ede6] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.lowStockItems.length ? (
            /* 2-col grid on mobile, stacked list on lg */
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-0 sm:gap-2 lg:gap-0 divide-y sm:divide-y-0 lg:divide-y divide-[#f2ede6]">
              {data.lowStockItems.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 sm:py-2 sm:px-3 sm:bg-[#faf8f5] sm:rounded-lg lg:py-3 lg:px-0 lg:bg-transparent lg:rounded-none">
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-[#1a1816] truncate">{p.name}</div>
                    <div className="text-[10px] text-[#888078] mt-0.5">
                      {p.stock === 0 ? "Out of stock" : `${p.stock} unit${p.stock === 1 ? "" : "s"} left`}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase ${
                    p.stock === 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"
                  }`}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#f2ede6] grid place-items-center mb-3">
                <Package size={16} className="text-[#c4a882]" strokeWidth={1.5} />
              </div>
              <p className="text-[12px] font-medium text-[#1a1816]">All good</p>
              <p className="text-[11px] text-[#888078] mt-0.5">Every product is well stocked.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; accent: "tan" | "warn" | "neutral";
}) {
  const accentCls =
    accent === "tan"    ? "bg-[#c4a882]/10 text-[#9b7b52]"
    : accent === "warn" ? "bg-rose-50 text-rose-500"
    : "bg-[#f2ede6] text-[#888078]";

  return (
    <div className="bg-white border border-[#e0d5c5] rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg grid place-items-center ${accentCls}`}>
        {icon}
      </div>
      <div>
        <div className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#0d0d0d] leading-none">{value}</div>
        <div className="text-[11px] sm:text-[12px] font-medium text-[#1a1816] mt-1.5 sm:mt-2">{label}</div>
        <div className="text-[10px] sm:text-[11px] text-[#888078] mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function QA({
  to, icon, label, primary,
}: {
  to: string; icon: React.ReactNode; label: string; primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center justify-between rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-[11.5px] sm:text-[12.5px] font-medium tracking-wide transition-all ${
        primary
          ? "bg-[#c4a882] text-[#0d0d0d] hover:bg-[#d4b892]"
          : "bg-white/8 text-white/60 hover:bg-white/12 hover:text-white/90 border border-white/10"
      }`}
    >
      <span className="flex items-center gap-2">{icon} {label}</span>
      <ArrowRight size={10} className={primary ? "text-[#0d0d0d]/50" : "text-white/30 group-hover:text-white/50"} />
    </Link>
  );
}
