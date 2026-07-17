import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Quote } from "lucide-react";

export const Route = createFileRoute("/admin/testimonials")({ component: TestimonialsPage });

type T = { id: string; name: string; quote: string; photo: string; sort_order: number; published: boolean };

function TestimonialsPage() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").order("sort_order").order("created_at", { ascending: false });
      return (data ?? []) as T[];
    },
  });
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Social proof</p>
          <h1 className="mt-2 font-serif text-[28px] text-neutral-900">Testimonials</h1>
          <p className="mt-1.5 text-sm text-neutral-600">Customer reviews shown across your storefront.</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", quote: "", photo: "", sort_order: items.length, published: true })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-black">
          <Plus size={14} /> New testimonial
        </button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100"><Quote size={18} className="text-neutral-400" /></div>
          <p className="mt-3 text-sm text-neutral-700">No testimonials yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t.id} className={`bg-white border rounded-2xl p-6 ${t.published ? "border-neutral-200" : "border-neutral-200 opacity-60"}`}>
              <div className="flex items-start gap-4">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-neutral-100 grid place-items-center shrink-0 text-neutral-400 font-medium">
                    {t.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-neutral-900">{t.name}</div>
                      {!t.published && <div className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">Hidden</div>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditing(t)} className="p-1.5 hover:bg-neutral-100 rounded"><Pencil size={13} /></button>
                      <button onClick={() => confirm("Delete?") && del.mutate(t.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] text-neutral-700 italic leading-relaxed">"{t.quote}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <Dialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["testimonials"] }); setEditing(null); }} />}
    </div>
  );
}

function Dialog({ initial, onClose, onSaved }: { initial: Partial<T>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<T>>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  function set<K extends keyof T>(k: K, v: T[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadPhoto(file: File) {
    setBusy(true); setErr(null);
    try {
      const path = `testimonial-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signed) set("photo", signed.signedUrl);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setErr(null);
    const payload = { name: form.name ?? "", quote: form.quote ?? "", photo: form.photo ?? "", sort_order: Number(form.sort_order ?? 0), published: form.published ?? true };
    const op = form.id ? supabase.from("testimonials").update(payload).eq("id", form.id) : supabase.from("testimonials").insert(payload);
    const { error } = await op;
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md my-8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">{form.id ? "Edit" : "New"} testimonial</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Customer name"><input className={inp} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Quote"><textarea rows={4} className={inp} value={form.quote ?? ""} onChange={(e) => set("quote", e.target.value)} /></Field>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-2">Photo (optional)</label>
            <div className="flex items-center gap-3">
              {form.photo ? (
                <img src={form.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-neutral-100" />
              )}
              <label className="flex-1 border-2 border-dashed border-neutral-300 rounded-lg p-3 cursor-pointer hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-600">
                <Upload size={14} /> {busy ? "Uploading…" : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
              </label>
            </div>
          </div>
          <Field label="Sort order"><input type="number" className={inp} value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published ?? true} onChange={(e) => set("published", e.target.checked)} />
            Published
          </label>
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{label}</label>{children}</div>;
}
