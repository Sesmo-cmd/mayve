import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Search, ArrowUpDown, Package } from "lucide-react";

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

type SortKey = "name" | "price" | "stock";

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "low" | "out">("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const del = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setSelected(new Set());
    },
  });

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (filter === "available") list = list.filter((p) => p.available && p.stock > 2);
    if (filter === "low") list = list.filter((p) => p.available && p.stock > 0 && p.stock < 3);
    if (filter === "out") list = list.filter((p) => !p.available || p.stock === 0);
    list = [...list].sort((a, b) => {
      if (sort === "price") return Number(b.price) - Number(a.price);
      if (sort === "stock") return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, query, filter, sort]);

  function toggle(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  }

  return (
    <div>
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Catalog</p>
          <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Products</h1>
          <p className="mt-1.5 text-sm text-neutral-600">{products.length} total · {categories.length} categories</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", description: "", price: 0, category: "", sizes: [], colors: [], stock: 0, available: true, images: [] })}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-black"
        >
          <Plus size={14} /> Add product
        </button>
      </header>

      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-3 border-b border-neutral-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5">
            {(["all", "available", "low", "out"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
                  filter === f ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {f === "out" ? "Out of stock" : f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium"
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock</option>
          </select>
        </div>

        {selected.size > 0 && (
          <div className="px-4 py-2.5 bg-neutral-900 text-white text-xs flex items-center justify-between">
            <span>{selected.size} selected</span>
            <button
              onClick={() => confirm(`Delete ${selected.size} products?`) && del.mutate(Array.from(selected))}
              className="inline-flex items-center gap-1.5 hover:text-red-300"
            >
              <Trash2 size={13} /> Delete selected
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <Package size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No products found</p>
            <p className="mt-1 text-xs text-neutral-500">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-neutral-500 bg-neutral-50/60">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const out = !p.available || p.stock === 0;
                  const low = p.available && p.stock > 0 && p.stock < 3;
                  return (
                    <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-11 h-11 object-cover rounded-md ring-1 ring-neutral-200" />
                          ) : (
                            <div className="w-11 h-11 bg-neutral-100 rounded-md grid place-items-center">
                              <Package size={14} className="text-neutral-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-neutral-900 truncate">{p.name}</div>
                            <div className="text-[11px] text-neutral-500 truncate">{p.sizes.join(", ") || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 text-xs">{p.category || "—"}</td>
                      <td className="px-4 py-3 font-medium">₦{Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full ring-1 ring-inset px-2 py-0.5 text-[11px] font-medium ${
                          out ? "bg-neutral-100 text-neutral-600 ring-neutral-200"
                          : low ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        }`}>
                          {out ? "Out of stock" : low ? "Low" : "Available"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-600">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirm("Delete this product?") && del.mutate([p.id])}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md text-neutral-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="font-semibold text-neutral-900">{form.id ? "Edit" : "Add"} product</h2>
            <p className="text-xs text-neutral-500 mt-0.5">All fields are saved instantly to your storefront.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 mb-2">Images</div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(form.images ?? []).map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-md ring-1 ring-neutral-200" />
                  <button
                    onClick={() => set("images", (form.images ?? []).filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                  ><X size={12} /></button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 text-sm border-2 border-dashed border-neutral-300 rounded-lg p-5 cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition">
              <Upload size={14} className="text-neutral-500" />
              <span className="text-neutral-700">{busy ? "Uploading…" : "Click to upload images"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          </div>

          {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
        </div>
        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 bg-white rounded-lg hover:bg-neutral-50">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-black disabled:opacity-60">{busy ? "Saving…" : "Save product"}</button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{label}</label>{children}</div>;
}
