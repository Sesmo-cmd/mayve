import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { MessageCircle, TrendingUp, ShoppingBag, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics-clicks"],
    queryFn: async () => {
      const [clicks, products] = await Promise.all([
        supabase.from("whatsapp_clicks").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("products").select("id,name"),
      ]);
      return { clicks: clicks.data ?? [], products: products.data ?? [] };
    },
  });

  const clicks = (data?.clicks ?? []) as any[];

  const weeks = useMemo(() => {
    const arr: { label: string; value: number }[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const s = new Date(now - i * 864e5);
      const start = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
      const end = start + 864e5;
      const v = clicks.filter((c) => {
        const t = new Date(c.created_at).getTime();
        return t >= start && t < end;
      }).length;
      arr.push({ label: s.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(), value: v });
    }
    return arr;
  }, [clicks]);
  const maxDay = Math.max(1, ...weeks.map((w) => w.value));

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    clicks.forEach((c) => {
      const key = c.product_name || "(general)";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [clicks]);

  const weekTotal = weeks.reduce((s, w) => s + w.value, 0);

  const stats = [
    { label: "WhatsApp clicks", value: clicks.length, hint: `${weekTotal} this week`, icon: MessageCircle },
    { label: "Products in catalogue", value: data?.products.length ?? 0, hint: "live listings", icon: ShoppingBag },
    { label: "Avg clicks / day", value: Math.round(weekTotal / 7), hint: "past 7 days", icon: TrendingUp },
    { label: "Site visitors", value: "—", hint: "tracking coming soon", icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Insights</p>
        <h1 className="mt-2 font-serif text-[28px] text-neutral-900">Analytics</h1>
        <p className="mt-1.5 text-sm text-neutral-600">How customers are engaging with your catalogue.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-neutral-200/70 bg-white p-5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f5efe6] text-[#a88356]">
                <Icon size={15} strokeWidth={1.75} />
              </div>
              <div className="mt-5 text-[26px] font-serif text-neutral-900 leading-none tabular-nums">{s.value}</div>
              <div className="mt-2 text-[13px] font-medium text-neutral-800">{s.label}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{s.hint}</div>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900">WHATSAPP CLICKS</div>
            <div className="text-[12px] text-neutral-500 mt-1">Last 7 days</div>
          </div>
          <div className="text-right">
            <div className="text-[24px] font-serif text-neutral-900 tabular-nums">{weekTotal}</div>
            <div className="text-[11px] text-neutral-500 mt-1">total this week</div>
          </div>
        </header>
        <div className="flex items-end gap-3 h-40">
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-neutral-900"
                  style={{ height: `${Math.max(2, (w.value / maxDay) * 100)}%`, opacity: w.value === 0 ? 0.08 : 1 }}
                  title={`${w.value} click${w.value === 1 ? "" : "s"}`}
                />
              </div>
              <div className="text-[10px] tracking-[0.14em] text-neutral-400">{w.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200/70 bg-white overflow-hidden">
        <header className="px-6 py-4 border-b border-neutral-100">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900">MOST INQUIRED PRODUCTS</div>
          <div className="text-[12px] text-neutral-500 mt-1">Ranked by WhatsApp clicks</div>
        </header>
        {topProducts.length === 0 ? (
          <div className="p-14 text-center text-sm text-neutral-500">No click data yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {topProducts.map((p, i) => {
              const max = topProducts[0].count;
              const pct = (p.count / max) * 100;
              return (
                <li key={i} className="px-6 py-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-neutral-900 truncate">{p.name}</span>
                    <span className="text-neutral-500 tabular-nums text-[12px]">{p.count} click{p.count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="h-1 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-[#c9a67a]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
