import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges — Mayve" },
      { name: "description", content: "Mayve returns and exchanges policy. Made-to-order pieces, exchanges and store credit only." },
      { property: "og:title", content: "Returns & Exchanges — Mayve" },
      { property: "og:description", content: "Exchanges and store credit policy for Mayve made-to-order pieces." },
    ],
  }),
  component: Returns,
});

const items = [
  {
    h: "Exchange Window",
    p: "1–2 business days (Abuja) · 3–5 business days (within Nigeria, outside Abuja) · 7–14 business days (international orders)",
  },
  {
    h: "Production Time for Exchanges",
    p: "As all pieces are made to order, exchanges require 10–12 business days for production before dispatch. Customers are responsible for all shipping costs. We strongly recommend reviewing our size guide before placing your order.",
  },
  {
    h: "Eligibility",
    p: "Items must be returned in their original condition, unworn, and unaltered. Items that show signs of wear, damage, or alteration will not be accepted.",
  },
  {
    h: "Damaged or Incorrect Items",
    p: "If your item arrives damaged or not in perfect condition, please contact us within 48 hours of delivery with a clear video showing the issue. Once reviewed, we will proceed with an exchange or store credit.",
  },
  {
    h: "Refunds",
    p: "Due to the made-to-order nature of our pieces, we do not offer refunds. Store credit or exchanges only.",
  },
];

function Returns() {
  return (
    <div className="returns-layout">
      <div className="returns-left">
        <h2>Returns &amp;<br /><em>Exchanges</em></h2>
        <p>We hope you love your Mayve piece. Each item is thoughtfully made to order with attention to detail and quality. Due to the made-to-order nature of our pieces, we do not offer refunds — but we are happy to assist with exchanges and store credit.</p>
      </div>
      <div>
        {items.map((it) => (
          <div key={it.h} className="ret-item">
            <h4>{it.h}</h4>
            <p>{it.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
