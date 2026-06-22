import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  Plus,
  Boxes,
  TrendingUp,
  ArrowUpRight,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
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
          .select("id,customer_name,product_name,status,created_at")
          .order("created_at", { ascending: false }),
      ]);
      const p = products.data ?? [];
      const o = orders.data ?? [];
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const ordersWeek = o.filter((x) => new Date(x.created_at).getTime() > weekAgo);
      return {
        total: p.length,
        low: p.filter((x) => x.available && x.stock > 0 && x.stock < 3).length,
        out: p.filter((x) => !x.available || x.stock === 0).length,
        inStockUnits: p.reduce((s, x) => s + (x.available ? x.stock : 0), 0),
        ordersAll: o,
        ordersWeekCount: ordersWeek.length,
        pending: o.filter((x) => x.status === "pending").length,
        delivered: o.filter((x) => x.status === "delivered").length,
        lowStockItems: p
          .filter((x) => x.available && x.stock < 3)
          .sort((a, b) => a.stock - b.stock)
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
      tone: "text-neutral-900",
      bg: "bg-neutral-100",
    },
    {
      label: "Orders this week",
      value: data?.ordersWeekCount ?? 0,
      hint: `${data?.ordersAll.length ?? 0} all time`,
      icon: TrendingUp,
      tone: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending orders",
      value: data?.pending ?? 0,
      hint: `${data?.delivered ?? 0} delivered`,
      icon: Clock,
      tone: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Needs restock",
      value: (data?.low ?? 0) + (data?.out ?? 0),
      hint: `${data?.out ?? 0} out of stock`,
      icon: AlertTriangle,
      tone: "text-red-700",
      bg: "bg-red-50",
    },
  ];

  const recent = data?.ordersAll.slice(0, 6) ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Overview</p>
          <h1 className="mt-1 truncate font-serif text-3xl md:text-4xl text-neutral-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            A snapshot of your storefront — products, orders and stock at a glance.
          </p>
        </div>
        <div className="hidden sm:flex shrink-0 gap-2">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
          >
            <Plus size={14} /> New product
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <SettingsIcon size={14} /> Settings
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`${s.bg} ${s.tone} grid h-10 w-10 place-items-center rounded-xl`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-neutral-300 transition group-hover:text-neutral-500"
                />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
                {isLoading ? "—" : s.value}
              </div>
              <div className="mt-1 text-sm text-neutral-700">{s.label}</div>
              <div className="mt-0.5 text-xs text-neutral-500">{s.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white">
          <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-medium text-neutral-900">Recent orders</h2>
              <p className="text-xs text-neutral-500">Latest WhatsApp orders you've logged.</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900"
            >
              View all →
            </Link>
          </header>
          {recent.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
                <ShoppingBag size={18} className="text-neutral-400" />
              </div>
              <p className="mt-3 text-sm text-neutral-700">No orders yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Log your first WhatsApp sale from the Orders page.
              </p>
              <Link
                to="/admin/orders"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
              >
                <Plus size={14} /> Log an order
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-6 py-3 font-medium text-neutral-900">{o.customer_name}</td>
                      <td className="px-6 py-3 text-neutral-700">{o.product_name}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                            statusStyles[o.status] ?? statusStyles.pending
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-neutral-500">
                        {formatDate(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Side column */}
        <aside className="space-y-6">
          {/* Quick actions */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-medium text-neutral-900">Quick actions</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Jump straight into the work.</p>
            <div className="mt-4 space-y-2">
              <Link
                to="/admin/products"
                className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white hover:bg-neutral-800"
              >
                <span className="flex items-center gap-2">
                  <Plus size={15} /> Add product
                </span>
                <ArrowUpRight size={14} />
              </Link>
              <Link
                to="/admin/inventory"
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  <Boxes size={15} /> Update inventory
                </span>
                <ArrowUpRight size={14} className="text-neutral-400" />
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag size={15} /> Log order
                </span>
                <ArrowUpRight size={14} className="text-neutral-400" />
              </Link>
            </div>
          </div>

          {/* Low stock */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900">Low stock</h2>
              <Link
                to="/admin/inventory"
                className="text-xs font-medium text-neutral-700 hover:text-neutral-900"
              >
                Manage →
              </Link>
            </div>
            {data?.lowStockItems.length ? (
              <ul className="mt-4 space-y-3">
                {data.lowStockItems.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-neutral-800">{p.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        p.stock === 0
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs text-emerald-700">
                <CheckCircle2 size={14} /> All products well stocked.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
