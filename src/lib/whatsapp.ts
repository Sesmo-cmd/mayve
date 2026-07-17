import { supabase } from "@/integrations/supabase/client";

export function whatsappLink(number: string, productName: string, template?: string) {
  const clean = (number || "").replace(/[^0-9]/g, "");
  const body = (template && template.trim())
    ? template.replace(/\{product\}/gi, productName)
    : `Hi, I want to order ${productName}`;
  const text = encodeURIComponent(body);
  return `https://wa.me/${clean}?text=${text}`;
}

export async function logWhatsappClick(opts: {
  productId?: string | null;
  productName: string;
  source?: string;
}) {
  try {
    await supabase.from("whatsapp_clicks").insert({
      product_id: opts.productId ?? null,
      product_name: opts.productName,
      source: opts.source ?? "",
    });
  } catch {
    /* best-effort; never block the outbound link */
  }
}
