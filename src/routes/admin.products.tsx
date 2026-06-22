import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsPage });

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  available: boolean;
  images: string[];
};

function ProductsPage() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <div className="max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">{products.length} total</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", description: "", price: 0, category: "", sizes: [], colors: [], stock: 0, available: true, images: [] })}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm hover:bg-neutral-800"
        >
          <Plus size={14} /> Add product
        </button>
      </header>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">No products yet. Add your first one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-100 rounded" />
                      )}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-500">{p.category || "Uncategorized"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">₦{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${p.available && p.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700"}`}>
                      {!p.available || p.stock === 0 ? "Out of stock" : p.stock < 3 ? "Low" : "Available"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="p-1 hover:bg-neutral-100 rounded"><Pencil size={14} /></button>
                      <button onClick={() => confirm("Delete this product?") && del.mutate(p.id)} className="p-1 hover:bg-red-50 text-red-600 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <ProductDialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); }} />}
    </div>
  );
}

function ProductDialog({ initial, onClose, onSaved }: { initial: Partial<Product>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Product>>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Product>(k: K, v: Product[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data: signed, error: sErr } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (sErr) throw sErr;
        uploaded.push(signed.signedUrl);
      }
      set("images", [...(form.images ?? []), ...uploaded]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true); setErr(null);
    const payload = {
      name: form.name ?? "",
      description: form.description ?? "",
      price: Number(form.price ?? 0),
      category: form.category ?? "",
      sizes: form.sizes ?? [],
      colors: form.colors ?? [],
      stock: Number(form.stock ?? 0),
      available: form.available ?? true,
      images: form.images ?? [],
    };
    const op = form.id
      ? supabase.from("products").update(payload).eq("id", form.id)
      : supabase.from("products").insert(payload);
    const { error } = await op;
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-medium">{form.id ? "Edit" : "Add"} product</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Name"><input className={inp} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Description"><textarea rows={3} className={inp} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₦)"><input type="number" className={inp} value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Stock"><input type="number" className={inp} value={form.stock ?? 0} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
          </div>
          <Field label="Category"><input className={inp} value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label="Sizes (comma separated)">
            <input className={inp} value={(form.sizes ?? []).join(", ")} onChange={(e) => set("sizes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Colors (comma separated)">
            <input className={inp} value={(form.colors ?? []).join(", ")} onChange={(e) => set("colors", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.available ?? true} onChange={(e) => set("available", e.target.checked)} />
            Available for purchase
          </label>

          <div>
            <div className="text-xs font-medium text-neutral-700 mb-2">Images</div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(form.images ?? []).map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded" />
                  <button
                    onClick={() => set("images", (form.images ?? []).filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5"
                  ><X size={12} /></button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm border border-dashed border-neutral-300 rounded p-3 cursor-pointer hover:bg-neutral-50">
              <Upload size={14} />
              <span>{busy ? "Uploading…" : "Upload images"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
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

const inp = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-neutral-700 block mb-1">{label}</label>{children}</div>;
}
