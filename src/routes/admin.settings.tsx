import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { MessageCircle, Building2, Check } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const [wa, setWa] = useState("");
  const [brand, setBrand] = useState("Mayve");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (data) { setWa(data.whatsapp_number ?? ""); setBrand(data.brand_name ?? "Mayve"); }
  }, [data]);

  async function save() {
    setBusy(true); setMsg(null); setOk(false);
    const { error } = await supabase.from("app_settings").update({ whatsapp_number: wa, brand_name: brand }).eq("id", 1);
    setBusy(false);
    if (error) setMsg(error.message);
    else { setOk(true); qc.invalidateQueries({ queryKey: ["settings"] }); setTimeout(() => setOk(false), 2500); }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Configuration</p>
        <h1 className="mt-1.5 font-serif text-3xl text-neutral-900">Settings</h1>
        <p className="mt-1.5 text-sm text-neutral-600">Powers WhatsApp order links on your storefront.</p>
      </header>

      <div className="grid gap-4 max-w-2xl">
        <Card icon={Building2} title="Brand" description="Public name used across your storefront.">
          <Field label="Brand name">
            <input className={inp} value={brand} onChange={(e) => setBrand(e.target.value)} />
          </Field>
        </Card>

        <Card icon={MessageCircle} title="WhatsApp" description="Where 'Buy via WhatsApp' messages are routed.">
          <Field label="WhatsApp number" hint="Include country code, e.g. +2348012345678">
            <input
              className={`${inp} font-mono`}
              placeholder="+2348012345678"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl px-5 py-4">
          <div className="text-xs text-neutral-500">
            {msg && <span className="text-red-600">{msg}</span>}
            {ok && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <Check size={14} /> Saved
              </span>
            )}
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

function Card({ icon: Icon, title, description, children }: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
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
