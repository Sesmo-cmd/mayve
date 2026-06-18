import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import tee1 from "@/assets/tee1.jpg";
import tee2 from "@/assets/tee2.jpg";
import bespoke1 from "@/assets/bespoke1.jpg";
import bespoke2 from "@/assets/bespoke2.jpg";
import velora1 from "@/assets/velora1.jpg";
import velora2 from "@/assets/velora2.jpg";
import aboutImg from "@/assets/about.jpg";
import { FadeUp } from "@/components/FadeUp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mayve — Comfort Meets Bold Elegance" },
      { name: "description", content: "Contemporary made-to-order fashion for the modern woman. Designed in Abuja." },
      { property: "og:title", content: "Mayve — Comfort Meets Bold Elegance" },
      { property: "og:description", content: "Contemporary made-to-order fashion for the modern woman." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <div className="hero">
        <img className="hero-bg" src={heroImg} alt="Mayve hero" />
        <div className="hero-big-text">MAYVE</div>
        <div className="hero-content">
          <span className="hero-tag">New Collection</span>
          <h1>Comfort<br />Meets <em>Bold</em><br />Elegance</h1>
          <p>Designed for the modern woman who refuses to choose between looking good and feeling free.</p>
          <Link to="/tee" className="btn btn-white">Explore Collection</Link>
        </div>
        <div className="hero-cards">
          <div className="hero-card">
            <img src={tee1} alt="Mayve Tee" />
            <div>
              <div className="hero-card-badge">New Arrival</div>
              <div className="hero-card-name">When Life Gives<br />You Lemons</div>
              <div className="hero-card-sub">Mayve Tee</div>
            </div>
          </div>
          <div className="hero-card">
            <img src={bespoke1} alt="Offset" />
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
          <h2>New Arrivals</h2>
          <Link to="/tee" className="see-all">See All</Link>
        </FadeUp>
        <div className="na-grid">
          {[tee1, tee2, tee1].map((src, i) => (
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
          <h2>The Offset Collection</h2>
          <Link to="/bespoke" className="see-all">See All</Link>
        </FadeUp>
        <div className="grid-4">
          {[bespoke1, bespoke2, bespoke1, bespoke2].map((src, i) => (
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
          <img src={aboutImg} alt="Our story" loading="lazy" />
        </div>
        <div className="about-band-copy">
          <p className="eyebrow">Our Story</p>
          <h2>Freedom in<br />Movement &amp;<br /><em>Expression</em></h2>
          <p>Mayve is a contemporary made-to-order brand rooted in the belief that style should never come at the expense of comfort. For the modern, multi-dimensional woman.</p>
          <div><Link to="/about" className="btn btn-outline-w">Read Our Story</Link></div>
        </div>
      </div>

      <section className="section section-cream">
        <FadeUp className="sh">
          <h2>Velora — Elevated Occasion</h2>
          <Link to="/bespoke" className="see-all">See All</Link>
        </FadeUp>
        <div className="grid-4">
          {[velora1, velora2, velora1, velora2].map((src, i) => (
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
