import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mayve" },
      { name: "description", content: "Get in touch with Mayve via WhatsApp, email, or visit us in Abuja, Nigeria." },
      { property: "og:title", content: "Contact — Mayve" },
      { property: "og:description", content: "Reach out to place an order, enquire about a bespoke piece, or just say hello." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="contact-wrap">
      <p className="eyebrow" style={{ marginBottom: 16 }}>Get in Touch</p>
      <h2>Let's <em>Connect</em></h2>
      <p className="sub">Reach out to place an order, enquire about a bespoke piece, or just say hello.</p>
      <div className="contact-grid">
        <div className="ci">
          <div className="lbl">WhatsApp</div>
          <div className="val"><a href="https://wa.me/2349167679987">09167679987</a></div>
        </div>
        <div className="ci">
          <div className="lbl">Email</div>
          <div className="val"><a href="mailto:hey.mayve@gmail.com">hey.mayve@gmail.com</a></div>
        </div>
        <div className="ci">
          <div className="lbl">Location</div>
          <div className="val">Abuja, Nigeria</div>
        </div>
      </div>
      <a href="https://wa.me/2349167679987" className="btn btn-tan">Message on WhatsApp</a>
    </div>
  );
}
