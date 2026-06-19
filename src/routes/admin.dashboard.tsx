import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, AlertTriangle, XCircle, ShoppingBag, Plus, Boxes } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id,name,stock,available"),
        supabase.from("orders").select("id,customer_name,product_name,status,created_at").order("created_at", { ascending: false }).limit(8),
      ]);
      const p = products.data ?? [];
      return {
        total: p.length,
        low: p.filter((x) => x.available && x.stock > 0 && x.stock < 3).length,
        out: p.filter((x) => !x.available || x.stock === 0).length,
        orders: orders.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Total products", value: data?.total ?? "—", icon: Package, color: "bg-neutral-900" },
    { label: "Low stock", value: data?.low ?? "—", icon: AlertTriangle, color: "bg-amber-600" },
    { label: "Out of stock", value: data?.out ?? "—", icon: XCircle, color: "bg-red-600" },
    { label: "Recent orders", value: data?.orders.length ?? "—", icon: ShoppingBag, color: "bg-emerald-700" },
  ];

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your store.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className={`${s.color} text-white w-8 h-8 rounded flex items-center justify-center mb-3`}>
              <s.icon size={16} />
            </div>
            <div className="text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-neutral-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs underline text-neutral-600">View all</Link>
          </div>
          {data?.orders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet. Log one from the Orders page.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-neutral-500 text-left">
                <tr><th className="pb-2">Customer</th><th className="pb-2">Product</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody>
                {data?.orders.map((o) => (
                  <tr key={o.id} className="border-t border-neutral-100">
                    <td className="py-2">{o.customer_name}</td>
                    <td className="py-2">{o.product_name}</td>
                    <td className="py-2"><span className="text-xs px-2 py-0.5 rounded bg-neutral-100">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-medium mb-4">Quick actions</h2>
          <div className="space-y-2">
            <Link to="/admin/products" className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded text-sm hover:bg-neutral-800">
              <Plus size={14} /> Add product
            </Link>
            <Link to="/admin/inventory" className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded text-sm hover:bg-neutral-100">
              <Boxes size={14} /> Update inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
