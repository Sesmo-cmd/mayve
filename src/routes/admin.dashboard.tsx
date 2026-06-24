import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Boxes,
  TrendingUp,
  ArrowUpRight,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  DollarSign,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id,name,stock,available,price,created_at"),
        supabase
          .from("orders")
          .select("id,customer_name,product_name,status,created_at,product_id")
          .order("created_at", { ascending: false }),
      ]);
      const p = products.data ?? [];
      const o = orders.data ?? [];
      const productPrice = new Map(p.map((x: any) => [x.id, Number(x.price ?? 0)]));
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Revenue trend last 7 days (sum delivered)
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
      const revenue = days.reduce((s, d) => s + d.value, 0);

      return {
        total: p.length,
        low: p.filter((x: any) => x.available && x.stock > 0 && x.stock < 3).length,
        out: p.filter((x: any) => !x.available || x.stock === 0).length,
        inStockUnits: p.reduce((s: number, x: any) => s + (x.available ? x.stock : 0), 0),
        ordersAll: o,
        ordersWeekCount: o.filter((x: any) => new Date(x.created_at).getTime() > weekAgo).length,
        pending: o.filter((x: any) => x.status === "pending").length,
        delivered: o.filter((x: any) => x.status === "delivered").length,
        revenue,
        days,
        lowStockItems: p
          .filter((x: any) => x.available && x.stock < 3)
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5),
      };
    },
  });

  const stats = [
    {
      label: "Total products",
      value: data?.total ?? 0,
      hint: `${data?.inStockUnits ?? 0} units in stock`,
      icon: Package,
      delta: null,
    },
    {
      label: "Orders this week",
      value: data?.ordersWeekCount ?? 0,
      hint: `${data?.ordersAll.length ?? 0} all time`,
      icon: TrendingUp,
      delta: "+12%",
    },
    {
      label: "Revenue (7d)",
      value: `₦${(data?.revenue ?? 0).toLocaleString()}`,
      hint: `${data?.delivered ?? 0} delivered orders`,
      icon: DollarSign,
      delta: null,
    },
    {
      label: "Low stock",
      value: (data?.low ?? 0) + (data?.out ?? 0),
      hint: `${data?.out ?? 0} out of stock`,
      icon: AlertTriangle,
      delta: null,
      warn: true,
    },
  ];

  const recent = data?.ordersAll.slice(0, 6) ?? [];
  const maxDay = Math.max(1, ...(data?.days.map((d) => d.value) ?? [1]));

  return (
    <div>
      {/* Header */}
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Overview</p>
          <h1 className="mt-1.5 font-serif text-3xl md:text-[34px] leading-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600">
            Here's what's happening with your storefront today.
          </p>
        </div>
        <div className="hidden sm:flex shrink-0 gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
            <Bell size={14} /> Alerts
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-black"
          >
            <Plus size={14} /> New product
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.warn ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-700"}`}>
                  <Icon size={16} />
                </div>
                {s.delta && (
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {s.delta}
                  </span>
                )}
              </div>
              <div className="mt-4 text-[26px] font-semibold tracking-tight text-neutral-900 leading-none">
                {isLoading ? "—" : s.value}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">{s.label}</div>
              <div className="mt-0.5 text-xs text-neutral-500">{s.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <section className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6">
          <header className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Revenue trend</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold tracking-tight">₦{(data?.revenue ?? 0).toLocaleString()}</div>
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Total</div>
            </div>
          </header>
          <div className="flex items-end gap-3 h-40">
            {(data?.days ?? []).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-neutral-900 to-neutral-700 transition-all hover:from-black"
                    style={{ height: `${Math.max(4, (d.value / maxDay) * 100)}%` }}
                    title={`₦${d.value.toLocaleString()}`}
                  />
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{d.label}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-neutral-900">Quick actions</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Jump into the work</p>
          <div className="mt-4 space-y-2">
            <QuickAction to="/admin/products" icon={Plus} label="Add product" primary />
            <QuickAction to="/admin/inventory" icon={Boxes} label="Update inventory" />
            <QuickAction to="/admin/orders" icon={ShoppingBag} label="Log an order" />
            <QuickAction to="/admin/settings" icon={SettingsIcon} label="Configure WhatsApp" />
          </div>
        </aside>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Latest WhatsApp orders you've logged</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-medium text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </header>
          {recent.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
                <ShoppingBag size={18} className="text-neutral-400" />
              </div>
              <p className="mt-3 text-sm text-neutral-700">No orders yet</p>
              <p className="mt-1 text-xs text-neutral-500">Log your first WhatsApp sale from the Orders page.</p>
              <Link to="/admin/orders" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-black">
                <Plus size={14} /> Log an order
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o: any) => (
                    <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-6 py-3.5 font-medium text-neutral-900">{o.customer_name}</td>
                      <td className="px-6 py-3.5 text-neutral-700">{o.product_name}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center rounded-full ring-1 ring-inset px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles[o.status] ?? statusStyles.pending}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-neutral-500">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Inventory alerts</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Items needing restock</p>
            </div>
            <Link to="/admin/inventory" className="text-xs font-medium text-neutral-700 hover:text-neutral-900">
              Manage →
            </Link>
          </div>
          {data?.lowStockItems.length ? (
            <ul className="mt-5 space-y-3">
              {data.lowStockItems.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-800 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Recommend: restock {Math.max(10 - p.stock, 5)} units
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-xs text-emerald-700">
              <CheckCircle2 size={14} /> All products well stocked.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, primary }: { to: string; icon: any; label: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition ${
        primary
          ? "bg-neutral-900 text-white hover:bg-black"
          : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon size={15} /> {label}
      </span>
      <ArrowUpRight size={13} className={primary ? "text-white/70" : "text-neutral-400 group-hover:text-neutral-700"} />
    </Link>
  );
}
