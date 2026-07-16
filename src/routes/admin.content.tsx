import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Check, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/content")({ component: ContentPage });

type Field = { key: string; label: string; multiline?: boolean; hint?: string };
type Section = { title: string; description: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    title: "Home — Hero",
    description: "Top of the homepage.",
    fields: [
      { key: "home.hero.tag", label: "Tag" },
      { key: "home.hero.title", label: "Headline (HTML allowed, use <em> for italics)", multiline: true },
      { key: "home.hero.description", label: "Description", multiline: true },
      { key: "home.hero.cta", label: "CTA button label" },
    ],
  },
  {
    title: "Home — Section titles",
    description: "Titles for product carousels on the homepage.",
    fields: [
      { key: "home.newarrivals.title", label: "New Arrivals title" },
      { key: "home.offset.title", label: "Offset section title" },
      { key: "home.velora.title", label: "Velora section title" },
    ],
  },
  {
    title: "Home — Our Story band",
    description: "The dark story band on the homepage.",
    fields: [
      { key: "home.about.eyebrow", label: "Eyebrow" },
      { key: "home.about.title", label: "Headline (HTML allowed)", multiline: true },
      { key: "home.about.description", label: "Description", multiline: true },
    ],
  },
  {
    title: "Mayve Tee page",
    description: "The /tee collection page.",
    fields: [
      { key: "tee.hero.eyebrow", label: "Eyebrow" },
      { key: "tee.hero.title", label: "Headline (HTML allowed)" },
      { key: "tee.hero.description", label: "Description", multiline: true },
      { key: "tee.footer.note", label: "Footer note" },
      { key: "tee.footer.cta", label: "Footer CTA label" },
    ],
  },
  {
    title: "Bespoke page",
    description: "The /bespoke portfolio page.",
    fields: [
      { key: "bespoke.hero.eyebrow", label: "Eyebrow" },
      { key: "bespoke.hero.title", label: "Headline (HTML allowed)" },
      { key: "bespoke.hero.description", label: "Description", multiline: true },
      { key: "bespoke.hero.cta", label: "CTA button label" },
      { key: "bespoke.velora.title", label: "Velora section title" },
    ],
  },
];

function ContentPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_content_admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key,value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
      return map;
    },
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save() {
    setBusy(true); setErr(null); setOk(false);
    const rows = Object.entries(form).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOk(true);
    qc.invalidateQueries({ queryKey: ["site_content"] });
    qc.invalidateQueries({ queryKey: ["site_content_admin"] });
    setTimeout(() => setOk(false), 2500);
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Storefront</p>
        <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Content & Writeups</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Edit the text shown on your public pages. Changes save instantly.</p>
      </header>

      <div className="grid gap-4 max-w-3xl">
        {SECTIONS.map((s) => (
          <div key={s.title} className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-neutral-900">{s.title}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{s.description}</p>
                <div className="mt-5 space-y-4">
                  {s.fields.map((f) => (
                    <div key={f.key}>
                      <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-600 block mb-1.5">{f.label}</label>
                      {f.multiline ? (
                        <textarea
                          rows={3}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                          value={form[f.key] ?? ""}
                          onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        />
                      ) : (
                        <input
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                          value={form[f.key] ?? ""}
                          onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="sticky bottom-4 flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="text-xs text-neutral-500">
            {err && <span className="text-red-600">{err}</span>}
            {ok && <span className="inline-flex items-center gap-1.5 text-emerald-700"><Check size={14} /> Saved</span>}
            {!err && !ok && <span>HTML like <code>&lt;em&gt;bold&lt;/em&gt;</code> is allowed in headlines.</span>}
          </div>
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
