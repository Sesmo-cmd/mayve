import { createFileRoute, Link } from "@tanstack/react-router";
import { img } from "@/assets/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Mayve — Our Story" },
      { name: "description", content: "Mayve is a contemporary made-to-order brand designed for the modern, multi-dimensional woman. Read our story." },
      { property: "og:title", content: "About Mayve — Our Story" },
      { property: "og:description", content: "A contemporary made-to-order brand for the modern, multi-dimensional woman." },
      { property: "og:image", content: img.aboutHero },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <div className="about-page-hero">
        <div className="aph-img"><img src={img.aboutHero} alt="About Mayve" /></div>
        <div className="aph-copy">
          <p className="eyebrow">About Mayve</p>
          <h1>The Story<br />Behind <em>Mayve</em></h1>
          <p>Mayve is a contemporary made-to-order brand rooted in the belief that style should never come at the expense of comfort. Designed for the modern, multi-dimensional woman — whether she is leading, building, nurturing, or simply moving through her day.</p>
          <p>Mayve began as a personal journey. In the process of rediscovering her style and refining her wardrobe, the founder found herself constantly searching for pieces that felt like a true balance — expressive yet comfortable, elevated yet effortless.</p>
          <p>Every Mayve design is rooted in that experience. Thoughtfully created for real life, each piece reflects a commitment to ease, movement, and quiet boldness.</p>
          <p style={{ fontStyle: "italic", color: "var(--warm)", fontSize: ".85rem", marginTop: 8 }}>
            Mayve is not just about getting dressed — it's about showing up fully, in comfort and in confidence.
          </p>
          <div style={{ marginTop: 32 }}><Link to="/contact" className="btn btn-black">Get in Touch</Link></div>
        </div>
      </div>
      <div className="vision-band">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Our Vision</p>
        <h2>To redefine the way women <em>experience</em> fashion</h2>
        <p style={{ marginTop: 20 }}>Through intentional design, quality craftsmanship, and a deep understanding of the modern woman, we strive to make effortless elegance a standard, not a luxury. Beyond clothing, Mayve aims to build a world where women feel confident showing up as they are — bold, expressive, and at ease.</p>
      </div>
      <div className="about-band">
        <div className="about-band-copy">
          <p className="eyebrow">From Unisex Essentials</p>
          <h2>Bold Simplicity<br />Fits <em>Real Life</em></h2>
          <p>From unisex essentials to elevated everyday wear and occasion pieces, Mayve delivers intentional design, quality craftsmanship, and bold simplicity that fits seamlessly into real life.</p>
          <div><Link to="/tee" className="btn btn-outline-w">Shop the Collection</Link></div>
        </div>
        <div className="about-band-img"><img src={img.aboutCollection} alt="Collection" loading="lazy" /></div>
      </div>
    </>
  );
}
