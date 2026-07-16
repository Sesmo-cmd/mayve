import { createFileRoute, Link } from "@tanstack/react-router";
import { img } from "@/assets/images";
import { FadeUp } from "@/components/FadeUp";
import { useSiteContent, HtmlText } from "@/lib/site-content";

export const Route = createFileRoute("/tee")({
  head: () => ({
    meta: [
      { title: "Mayve Tee — Unisex Made-to-Order Essentials" },
      { name: "description", content: "Mayve Tee: unisex essentials crafted for comfort and bold simplicity. Each piece is made to order." },
      { property: "og:title", content: "Mayve Tee — Unisex Essentials" },
      { property: "og:description", content: "Unisex essentials crafted for comfort and bold simplicity." },
      { property: "og:image", content: img.tee[0] },
    ],
  }),
  component: Tee,
});

function Tee() {
  const numerals = ["I", "II", "III", "IV", "V", "VI"];
  const t = useSiteContent({
    "tee.hero.eyebrow": "Collection",
    "tee.hero.title": "Mayve <em>Tee</em>",
    "tee.hero.description": "Unisex essentials crafted for comfort and bold simplicity. Each piece is made to order — thoughtfully produced just for you.",
    "tee.footer.note": "All pieces made to order · Production: 10–12 business days",
    "tee.footer.cta": "Place an Order",
  });
  return (
    <>
      <div className="collection-hero">
        <p className="eyebrow" style={{ marginBottom: 12 }}>{t("tee.hero.eyebrow")}</p>
        <HtmlText as="h1" html={t("tee.hero.title")} />
        <p>{t("tee.hero.description")}</p>
      </div>
      <section className="section section-cream">
        <div className="grid-3">
          {img.tee.map((src, i) => (
            <FadeUp key={i} className="pcard">
              <div className="pcard-img">
                <span className="pcard-badge">Made to Order</span>
                <img src={src} alt={`Tee ${numerals[i]}`} loading="lazy" />
              </div>
              <div className="pcard-name">When Life Gives You Lemons — {numerals[i]}</div>
              <div className="pcard-sub">Mayve Tee</div>
            </FadeUp>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 16 }}>
            {t("tee.footer.note")}
          </p>
          <Link to="/contact" className="btn btn-black">{t("tee.footer.cta")}</Link>
        </div>
      </section>
    </>
  );
}
