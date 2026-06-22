import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { img } from "@/assets/images";
import { FadeUp } from "@/components/FadeUp";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mayve — Feel The Vibes" },
      { name: "description", content: "Bold made-to-order fashion. Designed in Abuja. Order via WhatsApp." },
      { property: "og:title", content: "Mayve — Feel The Vibes" },
      { property: "og:description", content: "Bold made-to-order fashion. Order via WhatsApp." },
      { property: "og:image", content: img.hero },
    ],
  }),
  component: Home,
});

const FALLBACK_NEW = [
  { name: "Daisy Shirt", category: "Mayve Tee", price: 18000, reviews: "129 Reviews", image: img.naTee1 },
  { name: "Rei Blue Jacket", category: "Bespoke", price: 42000, reviews: "92 Reviews", image: img.naTee2 },
  { name: "Rozz Jacket", category: "Velora", price: 35000, reviews: "72 Reviews", image: img.naTee3 },
];

const FALLBACK_BEST = [
  { name: "Molly Jacket", price: 28000, reviews: "3k Reviews", image: img.offset1 },
  { name: "Pop Star Neon", price: 41000, reviews: "2k Reviews", image: img.offset2 },
  { name: "Gaby Half-Zipped", price: 27000, reviews: "3k Reviews", image: img.offset3 },
  { name: "Smith Sweatshirt", price: 22000, reviews: "5k Reviews", image: img.offset4 },
];

function Home() {
  const { data } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const [products, settings] = await Promise.all([
        supabase.from("products").select("*").eq("available", true).gt("stock", 0).order("created_at", { ascending: false }).limit(8),
        supabase.from("app_settings").select("whatsapp_number").eq("id", 1).maybeSingle(),
      ]);
      return { products: products.data ?? [], whatsapp: settings.data?.whatsapp_number ?? "" };
    },
  });

  const realProducts = data?.products ?? [];
  const whatsapp = data?.whatsapp ?? "";
  const newArrivals = realProducts.slice(0, 3);
  const bestSellers = realProducts.slice(3, 7);
  const showFallback = realProducts.length === 0;

  return (
    <>
      {/* HERO */}
      <section className="vibes-hero">
        <h1 className="vibes-title">FEEL THE VIBES</h1>

        <div className="vibes-marquee">
          <div className="vibes-marquee-track">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>
                CATCH THE STYLE <span className="star">✦</span>
              </span>
            ))}
          </div>
        </div>

        <div className="vibes-stage">
          <img src={img.hero} alt="Mayve new season" className="vibes-stage-img" />

          <div className="vibes-floating vibes-floating-tl">
            <img src={img.heroCardTee} alt="" />
            <span>New Arrival</span>
          </div>
          <div className="vibes-floating vibes-floating-br">
            <img src={img.heroCardOffset} alt="" />
            <span>New Arrival</span>
          </div>

          <div className="vibes-copy">
            <h2>Get ready for new<br />season with Mayve</h2>
            <p>Mayve brings something new this season, specially designed for every style you need.</p>
            <Link to="/shop" className="vibes-cta">Explore items →</Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVAL */}
      <section className="vibes-section">
        <FadeUp className="vibes-section-head">
          <h2>New Arrival</h2>
          <Link to="/shop" className="vibes-pill">See All</Link>
        </FadeUp>

        <div className="vibes-row-3">
          {showFallback
            ? FALLBACK_NEW.map((p, i) => (
                <FadeUp key={i} className="vibes-row-card">
                  <div className="vibes-row-thumb"><img src={p.image} alt={p.name} loading="lazy" /></div>
                  <div className="vibes-row-info">
                    <h4>{p.name}</h4>
                    <div className="vibes-stars">★★★★★ <span>({p.reviews})</span></div>
                    <div className="vibes-price">₦{p.price.toLocaleString()}</div>
                  </div>
                </FadeUp>
              ))
            : newArrivals.map((p: any) => (
                <FadeUp key={p.id} className="vibes-row-card">
                  <div className="vibes-row-thumb">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div className="vibes-row-thumb-empty" />}
                  </div>
                  <div className="vibes-row-info">
                    <h4>{p.name}</h4>
                    <div className="vibes-stars">★★★★★ <span>({p.category || "Mayve"})</span></div>
                    <div className="vibes-price">₦{Number(p.price).toLocaleString()}</div>
                    <a className="vibes-buy" href={whatsappLink(whatsapp, p.name)} target="_blank" rel="noreferrer">Order on WhatsApp</a>
                  </div>
                </FadeUp>
              ))}
        </div>
      </section>

      {/* BEST SELLER */}
      <section className="vibes-section">
        <FadeUp className="vibes-section-head">
          <h2>Best Seller</h2>
          <Link to="/shop" className="vibes-pill">See All</Link>
        </FadeUp>

        <div className="vibes-grid-4">
          {(showFallback ? FALLBACK_BEST : bestSellers).map((p: any, i: number) => {
            const isReal = !showFallback;
            const image = isReal ? p.images?.[0] : p.image;
            const price = Number(p.price);
            return (
              <FadeUp key={isReal ? p.id : i} className="vibes-bcard">
                <div className="vibes-bcard-img">
                  {image ? <img src={image} alt={p.name} loading="lazy" /> : <div className="vibes-bcard-empty" />}
                </div>
                <div className="vibes-bcard-body">
                  <h4>{p.name}</h4>
                  <div className="vibes-stars">★★★★★ <span>({isReal ? (p.category || "Mayve") : p.reviews})</span></div>
                  <div className="vibes-price">₦{price.toLocaleString()}</div>
                  {isReal && (
                    <a className="vibes-buy" href={whatsappLink(whatsapp, p.name)} target="_blank" rel="noreferrer">Order on WhatsApp</a>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* STORY BAND */}
      <section className="vibes-story">
        <div className="vibes-story-img">
          <img src={img.aboutBand} alt="Our story" loading="lazy" />
        </div>
        <div className="vibes-story-copy">
          <p className="vibes-eyebrow">Our Story</p>
          <h2>Designed in Abuja.<br />Made for movement.</h2>
          <p>Mayve is a contemporary made-to-order brand for the modern, multi-dimensional woman — bold simplicity, comfort without compromise.</p>
          <Link to="/about" className="vibes-cta vibes-cta-dark">Read Our Story →</Link>
        </div>
      </section>
    </>
  );
}
