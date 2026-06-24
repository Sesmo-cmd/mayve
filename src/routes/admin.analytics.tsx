import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, Package } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,price,stock"),
      ]);
      return { orders: orders.data ?? [], products: products.data ?? [] };
    },
  });

  const o = (data?.orders ?? []) as any[];
  const p = (data?.products ?? []) as any[];
  const priceMap = new Map(p.map((x) => [x.id, Number(x.price ?? 0)]));

  const revenue = useMemo(() => o.filter((x) => x.status !== "cancelled").reduce((s, x) => s + (priceMap.get(x.product_id) ?? 0), 0), [o, p]);

  const months = useMemo(() => {
    const arr: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const value = o
        .filter((x) => {
          const t = new Date(x.created_at).getTime();
          return t >= start && t < end && x.status !== "cancelled";
        })
        .reduce((s, x) => s + (priceMap.get(x.product_id) ?? 0), 0);
      arr.push({ label: d.toLocaleDateString(undefined, { month: "short" }), value });
    }
    return arr;
  }, [o, p]);
  const maxMonth = Math.max(1, ...months.map((m) => m.value));

  const topProducts = useMemo(() => {
    const counts = new Map<string, { name: string; count: number; revenue: number }>();
    for (const x of o) {
      const key = x.product_name;
      const ex = counts.get(key);
      const r = priceMap.get(x.product_id) ?? 0;
      if (ex) { ex.count++; ex.revenue += r; }
      else counts.set(key, { name: key, count: 1, revenue: r });
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [o, p]);

  const statusBreakdown = useMemo(() => {
    const all = ["pending", "processing", "delivered", "cancelled"];
    return all.map((s) => ({ status: s, count: o.filter((x) => x.status === s).length }));
  }, [o]);
  const totalForBreakdown = Math.max(1, statusBreakdown.reduce((s, x) => s + x.count, 0));

  const stats = [
    { label: "Total revenue", value: `₦${revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Total orders", value: o.length, icon: ShoppingBag },
    { label: "Avg order value", value: `₦${o.length ? Math.round(revenue / o.length).toLocaleString() : 0}`, icon: TrendingUp },
    { label: "Products live", value: p.length, icon: Package },
  ];

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Insights</p>
        <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Analytics</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Performance across your storefront.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                <Icon size={16} />
              </div>
              <div className="mt-4 text-[24px] font-semibold tracking-tight text-neutral-900 leading-none">{s.value}</div>
              <div className="mt-2 text-sm text-neutral-700 font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <section className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6">
          <header className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Revenue</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Last 6 months</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold tracking-tight">₦{revenue.toLocaleString()}</div>
            </div>
          </header>
          <div className="flex items-end gap-4 h-48">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-neutral-900 to-neutral-600"
                    style={{ height: `${Math.max(4, (m.value / maxMonth) * 100)}%` }}
                    title={`₦${m.value.toLocaleString()}`}
                  />
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-neutral-900">Order status</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Distribution</p>
          <ul className="mt-5 space-y-3">
            {statusBreakdown.map((s) => {
              const pct = Math.round((s.count / totalForBreakdown) * 100);
              return (
                <li key={s.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize text-neutral-700 font-medium">{s.status}</span>
                    <span className="text-neutral-500 tabular-nums">{s.count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-neutral-900" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <header className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Top selling products</h2>
          <p className="text-xs text-neutral-500 mt-0.5">By order count</p>
        </header>
        {topProducts.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-500">No sales data yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((t, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="px-6 py-3.5 font-medium text-neutral-900">{t.name}</td>
                  <td className="px-6 py-3.5 tabular-nums">{t.count}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums">₦{t.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
