import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Filter, ChevronDown, Package, ArrowLeft, ArrowRight } from "lucide-react";

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
type FilterKey = "all" | "active" | "draft" | "out";
const PAGE_SIZE = 10;

function statusOf(p: Product): "Active" | "Draft" | "Out of Stock" {
  if (!p.available) return "Draft";
  if (p.stock === 0) return "Out of Stock";
  return "Active";
}

const statusStyles: Record<string, string> = {
  Active: "text-emerald-700 ring-emerald-200 bg-emerald-50",
  Draft: "text-amber-700 ring-amber-200 bg-amber-50",
  "Out of Stock": "text-rose-700 ring-rose-200 bg-rose-50",
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => {
    let list = products;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (filter === "active") list = list.filter((p) => p.available && p.stock > 0);
    if (filter === "draft") list = list.filter((p) => !p.available);
    if (filter === "out") list = list.filter((p) => p.available && p.stock === 0);
    list = [...list].sort((a, b) => {
      if (sort === "price") return Number(b.price) - Number(a.price);
      if (sort === "stock") return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, query, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggle(id: string) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }
  function toggleAll() {
    if (pageItems.every((p) => selected.has(p.id))) {
      const s = new Set(selected);
      pageItems.forEach((p) => s.delete(p.id));
      setSelected(s);
    } else {
      const s = new Set(selected);
      pageItems.forEach((p) => s.add(p.id));
      setSelected(s);
    }
  }

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((p) => selected.has(p.id));

  return (
    <div>
      <div className="bg-white border border-neutral-200 rounded-2xl">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <h2 className="text-[15px] font-semibold text-neutral-900">Products list</h2>
            <div className="relative ml-auto max-w-xs hidden sm:block">
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search products…"
                className="w-64 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Filter size={13} /> Filter
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
                  {([
                    ["all", "All products"],
                    ["active", "Active"],
                    ["draft", "Draft"],
                    ["out", "Out of stock"],
                  ] as const).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => { setFilter(k); setFilterOpen(false); setPage(1); }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-neutral-50 ${filter === k ? "text-indigo-700 font-medium" : "text-neutral-700"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
            </select>
            <button
              onClick={() => setEditing({ name: "", description: "", price: 0, category: "", sizes: [], colors: [], stock: 0, available: true, images: [] })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="px-6 py-2.5 bg-neutral-900 text-white text-[13px] flex items-center justify-between">
            <span>{selected.size} selected</span>
            <button
              onClick={() => confirm(`Delete ${selected.size} products?`) && del.mutate(Array.from(selected))}
              className="inline-flex items-center gap-1.5 hover:text-rose-300"
            >
              <Trash2 size={13} /> Delete selected
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <Package size={18} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-sm text-neutral-700">No products found</p>
            <p className="mt-1 text-xs text-neutral-500">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                  <th className="px-6 py-3.5 w-10">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="rounded border-neutral-300" />
                  </th>
                  <th className="px-2 py-3.5 font-medium">
                    <button className="inline-flex items-center gap-1 hover:text-neutral-700">
                      Product Name <ChevronDown size={11} />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 font-medium">
                    <button className="inline-flex items-center gap-1 hover:text-neutral-700">
                      Category <ChevronDown size={11} />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 font-medium">
                    <button className="inline-flex items-center gap-1 hover:text-neutral-700">
                      Price <ChevronDown size={11} />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 font-medium">
                    <button className="inline-flex items-center gap-1 hover:text-neutral-700">
                      Stock <ChevronDown size={11} />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 font-medium">
                    <button className="inline-flex items-center gap-1 hover:text-neutral-700">
                      Status <ChevronDown size={11} />
                    </button>
                  </th>
                  <th className="px-6 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => {
                  const status = statusOf(p);
                  const isSelected = selected.has(p.id);
                  return (
                    <tr key={p.id} className={`border-b border-neutral-100 last:border-0 transition ${isSelected ? "bg-indigo-50/40" : "hover:bg-neutral-50/60"}`}>
                      <td className="px-6 py-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggle(p.id)} className="rounded border-neutral-300" />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                          ) : (
                            <div className="w-10 h-10 bg-neutral-100 rounded-md grid place-items-center">
                              <Package size={14} className="text-neutral-400" />
                            </div>
                          )}
                          <div className="font-medium text-neutral-900 truncate max-w-[200px]">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-neutral-900 tabular-nums">₦{Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-neutral-700 tabular-nums">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full ring-1 ring-inset px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => setEditing(p)} className="text-[13px] font-medium text-indigo-600 hover:text-indigo-800">
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ArrowLeft size={13} /> Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                const n = i + 1;
                const active = n === safePage;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-[13px] font-medium ${
                      active ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-neutral-400">…</span>}
            </div>
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              Next <ArrowRight size={13} />
            </button>
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

  async function remove() {
    if (!form.id || !confirm("Delete this product?")) return;
    setBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", form.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="font-semibold text-neutral-900">{form.id ? "Edit" : "Add"} product</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Changes sync instantly to your storefront.</p>
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
            <label className="flex items-center justify-center gap-2 text-sm border-2 border-dashed border-neutral-300 rounded-lg p-5 cursor-pointer hover:bg-neutral-50 hover:border-indigo-400 transition">
              <Upload size={14} className="text-neutral-500" />
              <span className="text-neutral-700">{busy ? "Uploading…" : "Click to upload images"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          </div>

          {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
        </div>
        <div className="p-5 border-t border-neutral-100 flex justify-between gap-2 bg-neutral-50 rounded-b-2xl">
          <div>
            {form.id && (
              <button onClick={remove} disabled={busy} className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg inline-flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 bg-white rounded-lg hover:bg-neutral-50">Cancel</button>
            <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">{busy ? "Saving…" : "Save product"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{label}</label>{children}</div>;
}
