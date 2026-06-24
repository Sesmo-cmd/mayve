import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Users, Search, Phone, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({ component: CustomersPage });

function CustomersPage() {
  const [query, setQuery] = useState("");
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; orders: number; last: string; status: string }>();
    for (const o of orders as any[]) {
      const key = o.phone || o.customer_name;
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        if (new Date(o.created_at) > new Date(existing.last)) {
          existing.last = o.created_at;
          existing.status = o.status;
        }
      } else {
        map.set(key, {
          name: o.customer_name,
          phone: o.phone,
          orders: 1,
          last: o.created_at,
          status: o.status,
        });
      }
    }
    const list = Array.from(map.values()).sort((a, b) => b.orders - a.orders);
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [orders, query]);

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Audience</p>
        <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Customers</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Derived from your WhatsApp order log.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Total customers" value={customers.length} />
        <Stat label="Repeat buyers" value={customers.filter((c) => c.orders > 1).length} />
        <Stat label="Total orders" value={orders.length} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-3 border-b border-neutral-100">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <Users size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No customers yet</p>
            <p className="mt-1 text-xs text-neutral-500">Customers appear once you log your first WhatsApp order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Last order</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-900 text-white grid place-items-center text-[11px] font-semibold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium text-neutral-900">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900">
                        <Phone size={12} /> {c.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-neutral-800">
                        <ShoppingBag size={12} className="text-neutral-400" /> {c.orders}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {new Date(c.last).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full ring-1 ring-inset px-2 py-0.5 text-[11px] font-medium ${
                        c.orders >= 3 ? "bg-amber-50 text-amber-700 ring-amber-200" :
                        c.orders === 2 ? "bg-blue-50 text-blue-700 ring-blue-200" :
                        "bg-neutral-100 text-neutral-600 ring-neutral-200"
                      }`}>
                        {c.orders >= 3 ? "VIP" : c.orders === 2 ? "Returning" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums text-neutral-900">{value}</div>
    </div>
  );
}
