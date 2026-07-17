import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Upload, Trash2, X, Images, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/lookbook")({ component: LookbookPage });

type Look = {
  id: string;
  title: string;
  season: string;
  image: string;
  collection_id: string | null;
  sort_order: number;
};

function LookbookPage() {
  const qc = useQueryClient();
  const { data: looks = [] } = useQuery({
    queryKey: ["lookbook"],
    queryFn: async () => {
      const { data } = await supabase.from("lookbook_images").select("*").order("sort_order").order("created_at", { ascending: false });
      return (data ?? []) as Look[];
    },
  });
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id,name").order("name");
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<Partial<Look> | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lookbook_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lookbook"] }),
  });

  async function bulkUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploadBusy(true);
    try {
      for (const file of Array.from(files)) {
        const path = `lookbook-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signed?.signedUrl) {
          await supabase.from("lookbook_images").insert({ title: "", season: "", image: signed.signedUrl });
        }
      }
      qc.invalidateQueries({ queryKey: ["lookbook"] });
    } finally { setUploadBusy(false); }
  }

  // Group by season
  const grouped = looks.reduce((acc: Record<string, Look[]>, l) => {
    const key = l.season?.trim() || "Uncategorised";
    (acc[key] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Editorial</p>
          <h1 className="mt-2 font-serif text-[28px] text-neutral-900">Lookbook</h1>
          <p className="mt-1.5 text-sm text-neutral-600">Curated fashion imagery grouped by season or collection.</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-black cursor-pointer">
          <Upload size={14} /> {uploadBusy ? "Uploading…" : "Bulk upload"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => bulkUpload(e.target.files)} />
        </label>
      </header>

      {looks.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100"><Images size={18} className="text-neutral-400" /></div>
          <p className="mt-3 text-sm text-neutral-700">No lookbook images yet</p>
          <p className="mt-1 text-xs text-neutral-500">Upload photoshoots and organise them by season or collection.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([season, items]) => (
            <section key={season}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 mb-3">{season} — {items.length}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((l) => (
                  <div key={l.id} className="group relative aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden">
                    <img src={l.image} alt={l.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition flex flex-col justify-end p-3">
                      {l.title && <div className="text-white text-sm font-medium truncate">{l.title}</div>}
                      <div className="mt-2 flex gap-1.5">
                        <button onClick={() => setEditing(l)} className="p-1.5 bg-white/90 rounded"><Pencil size={12} /></button>
                        <button onClick={() => confirm("Delete this image?") && del.mutate(l.id)} className="p-1.5 bg-white/90 text-rose-600 rounded"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <EditDialog
          initial={editing}
          collections={collections as any}
          onClose={() => setEditing(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["lookbook"] }); setEditing(null); }}
        />
      )}
    </div>
  );
}

function EditDialog({ initial, collections, onClose, onSaved }: { initial: Partial<Look>; collections: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Look>>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  function set<K extends keyof Look>(k: K, v: Look[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.id) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.from("lookbook_images").update({
      title: form.title ?? "",
      season: form.season ?? "",
      collection_id: form.collection_id || null,
      sort_order: Number(form.sort_order ?? 0),
    }).eq("id", form.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Edit image</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {form.image && <img src={form.image} alt="" className="w-full max-h-64 object-contain rounded-lg bg-neutral-50" />}
          <Field label="Title"><input className={inp} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Season" hint="e.g. SS26, Fall '25"><input className={inp} value={form.season ?? ""} onChange={(e) => set("season", e.target.value)} /></Field>
          <Field label="Collection">
            <select className={inp} value={form.collection_id ?? ""} onChange={(e) => set("collection_id", (e.target.value || null) as any)}>
              <option value="">— None —</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Sort order"><input type="number" className={inp} value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
          {err && <div className="text-xs text-red-600">{err}</div>}
        </div>
        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-neutral-300 bg-white rounded-lg">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg">{busy ? "Saving…" : "Save"}</button>
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
