import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { AlertTriangle, Package, Search, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({ component: InventoryPage });

function InventoryPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id,name,stock,available,images,category,price").order("name");
      return data ?? [];
    },
  });
  const update = useMutation({
    mutationFn: async (v: { id: string; stock?: number; available?: boolean }) => {
      const { id, ...rest } = v;
      const { error } = await supabase.from("products").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const filtered = useMemo(() => {
    let list = products as any[];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filter === "low") list = list.filter((p) => p.available && p.stock > 0 && p.stock < 3);
    if (filter === "out") list = list.filter((p) => !p.available || p.stock === 0);
    return list;
  }, [products, query, filter]);

  const stats = useMemo(() => {
    const p = products as any[];
    return {
      total: p.length,
      low: p.filter((x) => x.available && x.stock > 0 && x.stock < 3).length,
      out: p.filter((x) => !x.available || x.stock === 0).length,
      units: p.reduce((s, x) => s + (x.available ? x.stock : 0), 0),
    };
  }, [products]);

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Operations</p>
        <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Inventory</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Manage stock levels. Items below 3 units are flagged for restock.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatBox label="SKUs" value={stats.total} />
        <StatBox label="Units in stock" value={stats.units} />
        <StatBox label="Low stock" value={stats.low} warn={stats.low > 0} />
        <StatBox label="Out of stock" value={stats.out} danger={stats.out > 0} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-3 border-b border-neutral-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5">
            {(["all", "low", "out"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
                  filter === f ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {f === "out" ? "Out of stock" : f === "low" ? "Low stock" : "All"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <Package size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No products match</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Recommend</th>
                  <th className="px-4 py-3 font-medium w-28">Stock</th>
                  <th className="px-4 py-3 font-medium w-28">Available</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <Row key={p.id} product={p} onUpdate={(v) => update.mutate(v)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, warn, danger }: { label: string; value: number; warn?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${danger ? "text-red-600" : warn ? "text-amber-600" : "text-neutral-900"}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ product, onUpdate }: { product: any; onUpdate: (v: { id: string; stock?: number; available?: boolean }) => void }) {
  const [stock, setStock] = useState<number>(product.stock);
  const low = product.available && stock > 0 && stock < 3;
  const out = !product.available || stock === 0;
  const recommend = stock < 5 ? Math.max(10 - stock, 5) : 0;
  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img src={product.images[0]} className="w-10 h-10 object-cover rounded-md ring-1 ring-neutral-200" />
          ) : (
            <div className="w-10 h-10 bg-neutral-100 rounded-md grid place-items-center">
              <Package size={14} className="text-neutral-400" />
            </div>
          )}
          <div className="font-medium text-neutral-900 truncate">{product.name}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-neutral-600">{product.category || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 rounded-full ring-1 ring-inset px-2 py-0.5 text-[11px] font-medium ${
          out ? "bg-red-50 text-red-700 ring-red-200"
          : low ? "bg-amber-50 text-amber-700 ring-amber-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
        }`}>
          {out && <AlertTriangle size={10} />}
          {out ? "Out" : low ? "Low" : "In stock"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-neutral-600">
        {recommend > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <TrendingDown size={12} /> Restock +{recommend}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="number" min={0} value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={() => stock !== product.stock && onUpdate({ id: product.id, stock })}
          className="w-20 border border-neutral-300 rounded-md px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={product.available}
            onChange={(e) => onUpdate({ id: product.id, available: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-neutral-900 relative transition">
            <div className="absolute top-0.5 left-0.5 bg-white h-4 w-4 rounded-full transition peer-checked:translate-x-4" />
          </div>
        </label>
      </td>
    </tr>
  );
}
