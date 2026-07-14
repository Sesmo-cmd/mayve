import { Link } from "@tanstack/react-router";
import logo from "@/assets/mayve-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="footer">
      <img src={logo.url} alt="Mayve" className="f-logo-img" />
      <span className="f-copy">
        © 2026 Mayve
        <Link to="/admin/login" aria-label="Studio" title="Studio" className="f-dot">·</Link>
        All rights reserved. Made to Order.
      </span>
      <div className="f-links">
        <Link to="/returns">Returns</Link>
        <Link to="/contact">Contact</Link>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
      </div>
    </footer>
  );
}
