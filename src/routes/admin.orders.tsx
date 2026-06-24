import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Plus, X, Search, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUSES = ["pending", "processing", "delivered", "cancelled"] as const;

const statusBadge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const updateStatus = useMutation({
    mutationFn: async (v: { id: string; status: typeof STATUSES[number] }) => {
      const { error } = await supabase.from("orders").update({ status: v.status }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUSES.forEach((s) => (c[s] = orders.filter((o: any) => o.status === s).length));
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((o: any) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    }
    return list;
  }, [orders, filter, query]);

  return (
    <div>
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Sales</p>
          <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Orders</h1>
          <p className="mt-1.5 text-sm text-neutral-600">Manually log and track WhatsApp orders.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-black">
          <Plus size={14} /> Log order
        </button>
      </header>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-3 border-b border-neutral-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, product, phone…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5 overflow-x-auto">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize whitespace-nowrap ${
                  filter === s ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {s} <span className="ml-1 text-neutral-400">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <ClipboardList size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No orders</p>
            <p className="mt-1 text-xs text-neutral-500">Orders you log will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o: any) => (
                  <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                    <td className="px-4 py-3 font-medium text-neutral-900">{o.customer_name}</td>
                    <td className="px-4 py-3"><a href={`tel:${o.phone}`} className="text-neutral-700 hover:text-neutral-900 underline-offset-2 hover:underline">{o.phone}</a></td>
                    <td className="px-4 py-3 text-neutral-700">{o.product_name}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value as typeof STATUSES[number] })}
                          className={`appearance-none text-xs font-medium rounded-full ring-1 ring-inset pl-2.5 pr-6 py-1 capitalize cursor-pointer ${statusBadge[o.status] ?? statusBadge.pending}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 max-w-xs truncate">{o.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && <AddOrderDialog onClose={() => setAdding(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["orders"] }); setAdding(false); }} />}
    </div>
  );
}

function AddOrderDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ customer_name: "", phone: "", product_name: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const { error } = await supabase.from("orders").insert(f);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Log order</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input label="Customer name" v={f.customer_name} on={(v) => setF({ ...f, customer_name: v })} />
          <Input label="Phone" v={f.phone} on={(v) => setF({ ...f, phone: v })} />
          <Input label="Product" v={f.product_name} on={(v) => setF({ ...f, product_name: v })} />
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">Notes</label>
            <textarea rows={3} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </div>
          {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
        </div>
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 bg-white rounded-lg hover:bg-neutral-50">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-black disabled:opacity-60">{busy ? "Saving…" : "Save order"}</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{label}</label>
      <input className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
