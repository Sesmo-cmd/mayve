import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Check, Building2, Instagram, Mail, MapPin, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type Settings = {
  brand_name: string;
  tagline: string;
  logo_url: string;
  email: string;
  address: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
};

const empty: Settings = {
  brand_name: "Mayve", tagline: "", logo_url: "", email: "", address: "",
  instagram_url: "", tiktok_url: "", facebook_url: "",
};

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const [form, setForm] = useState<Settings>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (data) setForm({
      brand_name: data.brand_name ?? "Mayve",
      tagline: (data as any).tagline ?? "",
      logo_url: (data as any).logo_url ?? "",
      email: (data as any).email ?? "",
      address: (data as any).address ?? "",
      instagram_url: (data as any).instagram_url ?? "",
      tiktok_url: (data as any).tiktok_url ?? "",
      facebook_url: (data as any).facebook_url ?? "",
    });
  }, [data]);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadLogo(file: File) {
    setUploading(true); setMsg(null);
    try {
      const path = `logo-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      set("logo_url", signed.signedUrl);
    } catch (e: any) { setMsg(e.message); }
    finally { setUploading(false); }
  }

  async function save() {
    setBusy(true); setMsg(null); setOk(false);
    const { error } = await supabase.from("app_settings").update(form as any).eq("id", 1);
    setBusy(false);
    if (error) setMsg(error.message);
    else { setOk(true); qc.invalidateQueries({ queryKey: ["settings"] }); setTimeout(() => setOk(false), 2500); }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Configuration</p>
        <h1 className="mt-2 font-serif text-[28px] text-neutral-900">Settings</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Brand identity, contact details, and social handles.</p>
      </header>

      <div className="grid gap-4 max-w-2xl">
        <Card icon={Building2} title="Brand identity" description="Displayed across your storefront.">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden grid place-items-center shrink-0">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">No logo</span>
              )}
            </div>
            <label className="flex-1 border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition flex items-center gap-2 text-sm text-neutral-600">
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            </label>
          </div>
          <Field label="Brand name">
            <input className={inp} value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
          </Field>
          <Field label="Tagline" hint="A short line under your logo (optional)">
            <input className={inp} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
        </Card>

        <Card icon={Mail} title="Contact" description="How customers can reach you outside WhatsApp.">
          <Field label="Email">
            <input type="email" className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@mayve.com" />
          </Field>
          <Field label="Address">
            <input className={inp} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Lagos, Nigeria" />
          </Field>
        </Card>

        <Card icon={Instagram} title="Social media" description="Links shown in your storefront footer.">
          <Field label="Instagram URL"><input className={inp} value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="TikTok URL"><input className={inp} value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
          <Field label="Facebook URL"><input className={inp} value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/…" /></Field>
        </Card>

        <div className="sticky bottom-4 flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="text-xs text-neutral-500">
            {msg && <span className="text-red-600">{msg}</span>}
            {ok && <span className="inline-flex items-center gap-1.5 text-emerald-700"><Check size={14} /> Saved</span>}
          </div>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-60">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, description, children }: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5efe6] text-[#a88356]">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
          <div className="mt-5 space-y-4">{children}</div>
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
