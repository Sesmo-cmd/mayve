import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (data) { setWa(data.whatsapp_number ?? ""); setBrand(data.brand_name ?? "Mayve"); }
  }, [data]);

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("app_settings").update({ whatsapp_number: wa, brand_name: brand }).eq("id", 1);
    setBusy(false);
    if (error) setMsg(error.message); else { setMsg("Saved."); qc.invalidateQueries({ queryKey: ["settings"] }); }
  }

  return (
    <div className="max-w-xl">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Powers WhatsApp order links on the storefront.</p>
      </header>

      <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-700 block mb-1">Brand name</label>
          <input className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700 block mb-1">WhatsApp number</label>
          <input
            className="w-full border border-neutral-300 rounded px-3 py-2 text-sm font-mono"
            placeholder="+2348012345678"
            value={wa}
            onChange={(e) => setWa(e.target.value)}
          />
          <p className="text-xs text-neutral-500 mt-1">Include country code. Used in "Buy via WhatsApp" links.</p>
        </div>
        {msg && <div className="text-xs text-neutral-600">{msg}</div>}
        <button onClick={save} disabled={busy} className="bg-neutral-900 text-white px-5 py-2 rounded text-sm hover:bg-neutral-800 disabled:opacity-60">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
