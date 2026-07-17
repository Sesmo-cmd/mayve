import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Check, MessageCircle, Copy, ExternalLink } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/whatsapp")({ component: WhatsappPage });

function WhatsappPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products-min"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id,name").order("name");
      return data ?? [];
    },
  });

  const [wa, setWa] = useState("");
  const [tpl, setTpl] = useState("Hi, I would like to inquire about {product}.");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pick, setPick] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data) {
      setWa(data.whatsapp_number ?? "");
      setTpl((data as any).whatsapp_template ?? "Hi, I would like to inquire about {product}.");
    }
  }, [data]);

  async function save() {
    setBusy(true); setMsg(null); setOk(false);
    const { error } = await supabase.from("app_settings")
      .update({ whatsapp_number: wa, whatsapp_template: tpl } as any).eq("id", 1);
    setBusy(false);
    if (error) setMsg(error.message);
    else { setOk(true); qc.invalidateQueries({ queryKey: ["settings"] }); setTimeout(() => setOk(false), 2500); }
  }

  const preview = tpl.replace(/\{product\}/gi, pick || "Silk Wrap Dress");
  const link = pick ? whatsappLink(wa, pick, tpl) : "";

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Customer channel</p>
        <h1 className="mt-2 font-serif text-[28px] text-neutral-900">WhatsApp</h1>
        <p className="mt-1.5 text-sm text-neutral-600">All customer inquiries route through WhatsApp. Configure your number and message template.</p>
      </header>

      <div className="grid gap-4 max-w-2xl">
        <Card icon={MessageCircle} title="Business WhatsApp" description="The number that receives all product inquiries.">
          <Field label="WhatsApp number" hint="Include country code, e.g. +2348012345678">
            <input className={`${inp} font-mono`} placeholder="+2348012345678" value={wa} onChange={(e) => setWa(e.target.value)} />
          </Field>
        </Card>

        <Card icon={MessageCircle} title="Message template" description="Pre-filled message when customers tap 'Chat on WhatsApp'. Use {product} as a placeholder.">
          <Field label="Default message">
            <textarea rows={3} className={inp} value={tpl} onChange={(e) => setTpl(e.target.value)} />
          </Field>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 mb-1">Preview</div>
            <div className="text-sm text-emerald-900 whitespace-pre-wrap">{preview}</div>
          </div>
        </Card>

        <Card icon={ExternalLink} title="Product-specific link" description="Generate a WhatsApp link for any product to share on social or in bios.">
          <Field label="Choose a product">
            <select className={inp} value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">— Select —</option>
              {products.map((p: any) => (<option key={p.id} value={p.name}>{p.name}</option>))}
            </select>
          </Field>
          {link && (
            <div className="flex items-stretch gap-2">
              <input readOnly value={link} className={`${inp} font-mono text-xs`} />
              <button onClick={copyLink} className="px-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-sm inline-flex items-center gap-1.5">
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
              <a href={link} target="_blank" rel="noreferrer" className="px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm inline-flex items-center gap-1.5">
                <ExternalLink size={13} /> Test
              </a>
            </div>
          )}
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
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5efe6] text-[#a88356]"><Icon size={16} /></div>
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
