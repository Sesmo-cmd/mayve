import { createFileRoute, Link } from "@tanstack/react-router";
import { img } from "@/assets/images";
import { FadeUp } from "@/components/FadeUp";
import { useSiteContent, HtmlText } from "@/lib/site-content";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mayve — Comfort Meets Bold Elegance" },
      { name: "description", content: "Contemporary made-to-order fashion for the modern woman. Designed in Abuja." },
      { property: "og:title", content: "Mayve — Comfort Meets Bold Elegance" },
      { property: "og:description", content: "Contemporary made-to-order fashion for the modern woman." },
      { property: "og:image", content: img.hero },
    ],
  }),
  component: Home,
});

function Home() {
  const t = useSiteContent({
    "home.hero.tag": "New Collection",
    "home.hero.title": "Comfort Meets <em>Bold</em> Elegance",
    "home.hero.description": "Designed for the modern woman who refuses to choose between looking good and feeling free.",
    "home.hero.cta": "Explore Collection",
    "home.about.eyebrow": "Our Story",
    "home.about.title": "Freedom in Movement & <em>Expression</em>",
    "home.about.description": "Mayve is a contemporary made-to-order brand rooted in the belief that style should never come at the expense of comfort. For the modern, multi-dimensional woman.",
    "home.newarrivals.title": "New Arrivals",
    "home.offset.title": "The Offset Collection",
    "home.velora.title": "Velora — Elevated Occasion",
  });
  return (
    <>
      <div className="hero">
        <img className="hero-bg" src={img.hero} alt="Mayve hero" />
        <div className="hero-big-text">MAYVE</div>
        <div className="hero-content">
          <span className="hero-tag">{t("home.hero.tag")}</span>
          <HtmlText as="h1" html={t("home.hero.title")} />
          <p>{t("home.hero.description")}</p>
          <Link to="/tee" className="btn btn-white">{t("home.hero.cta")}</Link>
        </div>
        <div className="hero-cards">
          <div className="hero-card">
            <img src={img.heroCardTee} alt="Mayve Tee" />
            <div>
              <div className="hero-card-badge">New Arrival</div>
              <div className="hero-card-name">When Life Gives<br />You Lemons</div>
              <div className="hero-card-sub">Mayve Tee</div>
            </div>
          </div>
          <div className="hero-card">
            <img src={img.heroCardOffset} alt="Offset" />
            <div>
              <div className="hero-card-badge">New Arrival</div>
              <div className="hero-card-name">The Offset<br />Collection</div>
              <div className="hero-card-sub">Bespoke</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ticker-bar">
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>Made to Order</span><span className="dot">✦</span>
              <span>Comfort Without Compromise</span><span className="dot">✦</span>
              <span>Designed in Abuja</span><span className="dot">✦</span>
              <span>Elevated Everyday Wear</span><span className="dot">✦</span>
              <span>Bold Simplicity</span><span className="dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="section section-alt">
        <FadeUp className="sh">
          <h2>{t("home.newarrivals.title")}</h2>
          <Link to="/tee" className="see-all">See All</Link>
        </FadeUp>
        <div className="na-grid">
          {[img.naTee1, img.naTee2, img.naTee3].map((src, i) => (
            <FadeUp key={i} className="na-card">
              <img src={src} alt={`Tee ${i + 1}`} loading="lazy" />
              <div className="na-card-info">
                <div className="stars">★★★★★</div>
                <div className="reviews">Made to Order</div>
                <h4>When Life Gives You Lemons — {["I", "II", "III"][i]}</h4>
                <div className="reviews" style={{ marginTop: 6 }}>Mayve Tee Collection</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="section">
        <FadeUp className="sh">
          <h2>{t("home.offset.title")}</h2>
          <Link to="/bespoke" className="see-all">See All</Link>
        </FadeUp>
        <div className="grid-4">
          {[img.offset1, img.offset2, img.offset3, img.offset4].map((src, i) => (
            <FadeUp key={i} className="pcard">
              <div className="pcard-img">
                <span className="pcard-badge">Bespoke</span>
                <img src={src} alt={`Offset ${i + 1}`} loading="lazy" />
              </div>
              <div className="pcard-name">Offset {["I", "II", "III", "IV"][i]}</div>
              <div className="pcard-sub">Made to Measure</div>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="about-band">
        <div className="about-band-img">
          <img src={img.aboutBand} alt="Our story" loading="lazy" />
        </div>
        <div className="about-band-copy">
          <p className="eyebrow">{t("home.about.eyebrow")}</p>
          <HtmlText as="h2" html={t("home.about.title")} />
          <p>{t("home.about.description")}</p>
          <div><Link to="/about" className="btn btn-outline-w">Read Our Story</Link></div>
        </div>
      </div>

      <section className="section section-cream">
        <FadeUp className="sh">
          <h2>{t("home.velora.title")}</h2>
          <Link to="/bespoke" className="see-all">See All</Link>
        </FadeUp>
        <div className="grid-4">
          {[img.veloraTeaser1, img.veloraTeaser2, img.veloraTeaser3, img.veloraTeaser4].map((src, i) => (
            <FadeUp key={i} className="pcard">
              <div className="pcard-img">
                <img src={src} alt={`Velora ${i + 1}`} loading="lazy" />
              </div>
              <div className="pcard-name">Velora {["I", "II", "III", "IV"][i]}</div>
              <div className="pcard-sub">Occasion Wear</div>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}

