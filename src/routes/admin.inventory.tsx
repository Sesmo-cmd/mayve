import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/admin/inventory")({ component: InventoryPage });

function InventoryPage() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id,name,stock,available,images").order("name");
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

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif">Inventory</h1>
        <p className="text-sm text-neutral-500 mt-1">Quick stock updates. Items below 3 are highlighted.</p>
      </header>

      <div className="bg-white border border-neutral-200 rounded-lg divide-y">
        {products.length === 0 && <div className="p-8 text-center text-sm text-neutral-500">No products.</div>}
        {products.map((p: any) => (
          <Row key={p.id} product={p} onUpdate={(v) => update.mutate(v)} />
        ))}
      </div>
    </div>
  );
}

function Row({ product, onUpdate }: { product: any; onUpdate: (v: { id: string; stock?: number; available?: boolean }) => void }) {
  const [stock, setStock] = useState<number>(product.stock);
  const low = product.available && stock > 0 && stock < 3;
  const out = !product.available || stock === 0;
  return (
    <div className={`p-4 flex items-center gap-4 ${low ? "bg-amber-50" : ""} ${out ? "bg-neutral-100" : ""}`}>
      {product.images?.[0] ? <img src={product.images[0]} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-neutral-200 rounded" />}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{product.name}</div>
        <div className="text-xs text-neutral-500">{out ? "Out of stock" : low ? "Low stock" : "In stock"}</div>
      </div>
      <input
        type="number" min={0} value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        onBlur={() => stock !== product.stock && onUpdate({ id: product.id, stock })}
        className="w-20 border border-neutral-300 rounded px-2 py-1 text-sm"
      />
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={product.available} onChange={(e) => onUpdate({ id: product.id, available: e.target.checked })} />
        Available
      </label>
    </div>
  );
}
