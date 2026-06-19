import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mayve" },
      { name: "description", content: "Shop Mayve pieces. Order directly via WhatsApp." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const [products, settings] = await Promise.all([
        supabase.from("products").select("*").eq("available", true).gt("stock", 0).order("created_at", { ascending: false }),
        supabase.from("app_settings").select("whatsapp_number").eq("id", 1).maybeSingle(),
      ]);
      return { products: products.data ?? [], whatsapp: settings.data?.whatsapp_number ?? "" };
    },
  });

  const products = data?.products ?? [];

  return (
    <section className="section">
      <div className="sh">
        <h2>Shop</h2>
      </div>
      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--ink-muted)", padding: "40px 0" }}>No products available right now. Check back soon.</p>
      ) : (
        <div className="na-grid">
          {products.map((p: any) => {
            const lowStock = p.stock < 3;
            return (
              <div key={p.id} className="na-card">
                {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div style={{ aspectRatio: "3/4", background: "#eee" }} />}
                <div className="na-card-info">
                  <div className="reviews">{p.category || "Mayve"}</div>
                  <h4>{p.name}</h4>
                  <div style={{ marginTop: 6, fontSize: 14 }}>₦{Number(p.price).toLocaleString()}</div>
                  {lowStock && <div style={{ marginTop: 4, fontSize: 11, color: "#b45309" }}>Only {p.stock} left</div>}
                  {p.description && <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink-muted)" }}>{p.description}</p>}
                  <a
                    href={whatsappLink(data?.whatsapp ?? "", p.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-white"
                    style={{ marginTop: 12, display: "inline-block" }}
                  >
                    Buy via WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
