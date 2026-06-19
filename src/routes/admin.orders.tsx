import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUSES = ["pending", "processing", "delivered", "cancelled"] as const;

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const updateStatus = useMutation({
    mutationFn: async (v: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status: v.status }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <div className="max-w-5xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Orders</h1>
          <p className="text-sm text-neutral-500 mt-1">Manually log and track WhatsApp orders.</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm hover:bg-neutral-800">
          <Plus size={14} /> Log order
        </button>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded border ${filter === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300"}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">No orders.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <tr key={o.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{o.customer_name}</td>
                  <td className="px-4 py-3"><a href={`tel:${o.phone}`} className="underline">{o.phone}</a></td>
                  <td className="px-4 py-3">{o.product_name}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })} className="text-xs border border-neutral-300 rounded px-2 py-1">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 max-w-xs truncate">{o.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-medium">Log order</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <Input label="Customer name" v={f.customer_name} on={(v) => setF({ ...f, customer_name: v })} />
          <Input label="Phone" v={f.phone} on={(v) => setF({ ...f, phone: v })} />
          <Input label="Product" v={f.product_name} on={(v) => setF({ ...f, product_name: v })} />
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Notes</label>
            <textarea rows={3} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </div>
          {err && <div className="text-xs text-red-600">{err}</div>}
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 rounded">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-700 block mb-1">{label}</label>
      <input className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
