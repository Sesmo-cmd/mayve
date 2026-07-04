import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ClipboardList, Package, AlertTriangle, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

const statusDot: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-sky-400",
  confirmed: "bg-sky-400",
  shipped: "bg-violet-400",
  delivered: "bg-emerald-400",
  cancelled: "bg-neutral-300",
};

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${n.toLocaleString()}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id,name,stock,available,price"),
        supabase
          .from("orders")
          .select("id,customer_name,product_name,status,created_at,product_id")
          .order("created_at", { ascending: false }),
      ]);
      const p = products.data ?? [];
      const o = orders.data ?? [];
      const priceMap = new Map(p.map((x: any) => [x.id, Number(x.price ?? 0)]));
      const now = Date.now();
      const weekAgo = now - 7 * 864e5;

      const days: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 864e5);
        const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const e = s + 864e5;
        const value = o
          .filter((x: any) => {
            const t = new Date(x.created_at).getTime();
            return t >= s && t < e && x.status !== "cancelled";
          })
          .reduce((sum: number, x: any) => sum + (priceMap.get(x.product_id) ?? 0), 0);
        days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(), value });
      }
      const weekRevenue = days.reduce((s, d) => s + d.value, 0);
      const revenueAll = o
        .filter((x: any) => x.status !== "cancelled")
        .reduce((s: number, x: any) => s + (priceMap.get(x.product_id) ?? 0), 0);
      const lowStock = p.filter((x: any) => x.available && x.stock < 3);

      return {
        products: p.length,
        unitsInStock: p.reduce((s: number, x: any) => s + (x.available ? x.stock : 0), 0),
        ordersAll: o.length,
        ordersWeek: o.filter((x: any) => new Date(x.created_at).getTime() > weekAgo).length,
        pending: o.filter((x: any) => x.status === "pending").length,
        stockAlerts: lowStock.length,
        revenueAll,
        weekRevenue,
        days,
        recent: o.slice(0, 5),
        lowStockItems: lowStock.sort((a: any, b: any) => a.stock - b.stock).slice(0, 4),
      };
    },
  });

  const maxDay = Math.max(1, ...(data?.days.map((d) => d.value) ?? [1]));

  const kpis = [
    { value: formatNaira(data?.revenueAll ?? 0), label: "Total Revenue", hint: `${formatNaira(data?.weekRevenue ?? 0)} this week` },
    { value: data?.ordersAll ?? 0, label: "Total Orders", hint: `${data?.ordersWeek ?? 0} this week`, icon: ClipboardList },
    { value: data?.products ?? 0, label: "Products Listed", hint: `${data?.unitsInStock ?? 0} units in stock`, icon: Package },
    { value: data?.pending ?? 0, label: "Pending Orders", hint: `${data?.stockAlerts ?? 0} stock alerts`, icon: AlertTriangle },
  ];
  const kpiIcons = [DollarSign, ClipboardList, Package, AlertTriangle];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">Dashboard</h1>
        <p className="text-[13px] text-neutral-500 mt-1">Your store at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = kpiIcons[i];
          return (
            <div key={k.label} className="bg-white rounded-xl border border-neutral-200/70 p-5">
              <div className="h-10 w-10 rounded-lg bg-[#f5efe6] grid place-items-center mb-6">
                <Icon size={16} className="text-[#a88356]" strokeWidth={2} />
              </div>
              <div className="text-[26px] font-semibold tracking-tight text-neutral-900 leading-none">{k.value}</div>
              <div className="mt-2 text-[13px] font-medium text-neutral-800">{k.label}</div>
              <div className="text-[12px] text-neutral-500 mt-0.5">{k.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <section className="bg-white rounded-xl border border-neutral-200/70 p-6 flex flex-col min-h-[280px]">
          <header className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-neutral-900">REVENUE</div>
              <div className="text-[12px] text-neutral-500 mt-1">Last 7 days</div>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-semibold tracking-tight text-neutral-900 leading-none">
                {formatNaira(data?.weekRevenue ?? 0)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1.5">↑ 7-day total</div>
            </div>
          </header>

          <div className="mt-6 flex-1 flex items-end gap-3 min-h-[140px]">
            {(data?.days ?? []).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-neutral-900"
                    style={{ height: `${Math.max(2, (d.value / maxDay) * 100)}%`, opacity: d.value === 0 ? 0.06 : 1 }}
                    title={formatNaira(d.value)}
                  />
                </div>
                <div className="text-[10px] tracking-[0.14em] text-neutral-400">{d.label}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="bg-[#0a0a0a] text-white rounded-xl p-5">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-white/80">QUICK ACTIONS</div>
          <div className="mt-5 space-y-2.5">
            <Link
              to="/admin/products"
              className="flex items-center justify-center gap-2 rounded-md bg-[#c9a67a] hover:bg-[#b8955f] text-neutral-900 text-[13px] font-semibold py-2.5 transition"
            >
              <Plus size={14} strokeWidth={2.5} /> Add product
            </Link>
            <Link to="/admin/inventory" className="block text-center rounded-md bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              Update stock
            </Link>
            <Link to="/admin/orders" className="block text-center rounded-md bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              Log an order
            </Link>
            <Link to="/admin/settings" className="block text-center rounded-md bg-white/[0.06] hover:bg-white/10 text-[13px] py-2.5 transition">
              WhatsApp
            </Link>
          </div>
        </aside>
      </div>

      {/* Recent orders + Stock alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="bg-white rounded-xl border border-neutral-200/70 overflow-hidden">
          <header className="flex items-center justify-between px-6 pt-5 pb-4">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-neutral-900">RECENT ORDERS</div>
              <div className="text-[12px] text-neutral-500 mt-1">Latest WhatsApp sales</div>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 hover:text-neutral-900">
              ALL ORDERS <ArrowRight size={11} />
            </Link>
          </header>
          {data?.recent.length ? (
            <div className="divide-y divide-neutral-100">
              {data.recent.map((o: any) => (
                <div key={o.id} className="grid grid-cols-[1.1fr_1.4fr_1fr_auto] items-center gap-4 px-6 py-3.5 text-[13px]">
                  <div className="text-neutral-900 font-medium truncate">{o.customer_name}</div>
                  <div className="text-neutral-700 truncate">{o.product_name}</div>
                  <div className="flex items-center gap-2 text-neutral-700 capitalize">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[o.status] ?? "bg-neutral-300"}`} />
                    {o.status}
                  </div>
                  <div className="text-[12px] text-neutral-500 whitespace-nowrap">{formatDate(o.created_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-[13px] text-neutral-500">No orders yet.</div>
          )}
        </section>

        <aside className="bg-white rounded-xl border border-neutral-200/70 p-5">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-neutral-900">STOCK ALERTS</div>
          {data?.lowStockItems.length ? (
            <ul className="mt-4 space-y-4">
              {data.lowStockItems.map((p: any) => (
                <li key={p.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-neutral-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {p.stock === 0 ? "Out of stock" : `${p.stock} unit${p.stock === 1 ? "" : "s"} left`}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                      p.stock === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.stock === 0 ? "OUT" : `${p.stock} LEFT`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[12px] text-neutral-500">All products well stocked.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
