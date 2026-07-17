import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Layers } from "lucide-react";

export const Route = createFileRoute("/admin/collections")({ component: CollectionsPage });

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  sort_order: number;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function CollectionsPage() {
  const qc = useQueryClient();
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("*").order("sort_order").order("name");
      return (data ?? []) as Collection[];
    },
  });
  const [editing, setEditing] = useState<Partial<Collection> | null>(null);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Merchandising</p>
          <h1 className="mt-2 font-serif text-[28px] text-neutral-900">Collections</h1>
          <p className="mt-1.5 text-sm text-neutral-600">Group products into curated collections shown across the site.</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", slug: "", description: "", cover_image: "", sort_order: collections.length })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-black">
          <Plus size={14} /> New collection
        </button>
      </header>

      {collections.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100"><Layers size={18} className="text-neutral-400" /></div>
          <p className="mt-3 text-sm text-neutral-700">No collections yet</p>
          <p className="mt-1 text-xs text-neutral-500">Suggested: Dresses, New Arrivals, Merch, Accessories, Seasonal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div key={c.id} className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-sm transition">
              <div className="aspect-[4/3] bg-neutral-100 relative">
                {c.cover_image ? (
                  <img src={c.cover_image} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-neutral-300"><Layers size={28} /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-neutral-900 truncate">{c.name}</h3>
                    <p className="text-[11px] text-neutral-500 font-mono">/{c.slug}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-neutral-100 rounded"><Pencil size={13} /></button>
                    <button onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"><Trash2 size={13} /></button>
                  </div>
                </div>
                {c.description && <p className="mt-2 text-[12px] text-neutral-600 line-clamp-2">{c.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CollectionDialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["collections"] }); setEditing(null); }} />}
    </div>
  );
}

function CollectionDialog({ initial, onClose, onSaved }: { initial: Partial<Collection>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Collection>>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Collection>(k: K, v: Collection[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadCover(file: File) {
    setBusy(true); setErr(null);
    try {
      const path = `collection-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      set("cover_image", signed.signedUrl);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setErr(null);
    const payload = {
      name: form.name ?? "",
      slug: (form.slug && form.slug.trim()) || slugify(form.name ?? ""),
      description: form.description ?? "",
      cover_image: form.cover_image ?? "",
      sort_order: Number(form.sort_order ?? 0),
    };
    const op = form.id
      ? supabase.from("collections").update(payload).eq("id", form.id)
      : supabase.from("collections").insert(payload);
    const { error } = await op;
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">{form.id ? "Edit" : "New"} collection</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Name"><input className={inp} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug" hint="Auto-generated from name if left blank">
            <input className={inp} placeholder={slugify(form.name ?? "")} value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Description"><textarea rows={3} className={inp} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Sort order"><input type="number" className={inp} value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-2">Cover image</label>
            {form.cover_image && <img src={form.cover_image} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />}
            <label className="flex items-center justify-center gap-2 text-sm border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
              <Upload size={14} />
              {busy ? "Uploading…" : form.cover_image ? "Replace image" : "Upload cover image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
            </label>
          </div>
          {err && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{err}</div>}
        </div>
        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 bg-white rounded-lg hover:bg-neutral-50">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-black disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900";
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-neutral-500 mt-1.5">{hint}</p>}
    </div>
  );
}
