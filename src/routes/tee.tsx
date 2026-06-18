import { createFileRoute, Link } from "@tanstack/react-router";
import tee1 from "@/assets/tee1.jpg";
import tee2 from "@/assets/tee2.jpg";
import { FadeUp } from "@/components/FadeUp";

export const Route = createFileRoute("/tee")({
  head: () => ({
    meta: [
      { title: "Mayve Tee — Unisex Made-to-Order Essentials" },
      { name: "description", content: "Mayve Tee: unisex essentials crafted for comfort and bold simplicity. Each piece is made to order." },
      { property: "og:title", content: "Mayve Tee — Unisex Essentials" },
      { property: "og:description", content: "Unisex essentials crafted for comfort and bold simplicity." },
      { property: "og:image", content: tee1 },
    ],
  }),
  component: Tee,
});

function Tee() {
  const images = [tee1, tee2, tee1, tee2, tee1, tee2];
  const numerals = ["I", "II", "III", "IV", "V", "VI"];
  return (
    <>
      <div className="collection-hero">
        <p className="eyebrow" style={{ marginBottom: 12 }}>Collection</p>
        <h1>Mayve <em>Tee</em></h1>
        <p>Unisex essentials crafted for comfort and bold simplicity. Each piece is made to order — thoughtfully produced just for you.</p>
      </div>
      <section className="section section-cream">
        <div className="grid-3">
          {images.map((src, i) => (
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
            All pieces made to order · Production: 10–12 business days
          </p>
          <Link to="/contact" className="btn btn-black">Place an Order</Link>
        </div>
      </section>
    </>
  );
}
