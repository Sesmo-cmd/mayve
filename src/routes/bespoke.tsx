import { createFileRoute, Link } from "@tanstack/react-router";
import { img } from "@/assets/images";
import { FadeUp } from "@/components/FadeUp";
import { useSiteContent, HtmlText } from "@/lib/site-content";

export const Route = createFileRoute("/bespoke")({
  head: () => ({
    meta: [
      { title: "Bespoke Portfolio — Mayve" },
      { name: "description", content: "An exclusive look into Mayve's bespoke world — made-to-measure pieces that reflect individuality and craftsmanship." },
      { property: "og:title", content: "Bespoke Portfolio — Mayve" },
      { property: "og:description", content: "Made-to-measure pieces. Individuality, precision, craftsmanship." },
      { property: "og:image", content: img.bespoke[0] },
    ],
  }),
  component: Bespoke,
});

function Bespoke() {
  const t = useSiteContent({
    "bespoke.hero.eyebrow": "Portfolio",
    "bespoke.hero.title": "Bespoke <em>Portfolio</em>",
    "bespoke.hero.description": "An exclusive look into Mayve's bespoke world — where ideas are transformed into refined, made-to-measure pieces. From initial concept to the final garment, each design reflects individuality, precision, and craftsmanship.",
    "bespoke.hero.cta": "Ready to Create Something Uniquely Yours?",
    "bespoke.velora.title": "Velora Collection",
  });
  return (
    <>
      <div className="bespoke-hero">
        <p className="eyebrow">{t("bespoke.hero.eyebrow")}</p>
        <HtmlText as="h1" html={t("bespoke.hero.title")} />
        <p>{t("bespoke.hero.description")}</p>
        <Link to="/contact" className="btn btn-black">{t("bespoke.hero.cta")}</Link>
      </div>
      <div className="bespoke-mosaic">
        {img.bespoke.map((src, i) => (
          <FadeUp key={i} className="bm-img">
            <img src={src} alt={`Bespoke ${i + 1}`} loading="lazy" />
          </FadeUp>
        ))}
      </div>
      <section className="section section-cream">
        <div className="sh"><h2>{t("bespoke.velora.title")}</h2></div>
        <div className="grid-4">
          {img.velora.map((src, i) => (
            <FadeUp key={i} className="pcard">
              <div className="pcard-img"><img src={src} alt={`Velora ${i + 1}`} loading="lazy" /></div>
              <div className="pcard-name">Velora {["I", "II", "III", "IV"][i]}</div>
              <div className="pcard-sub">Occasion Wear</div>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
