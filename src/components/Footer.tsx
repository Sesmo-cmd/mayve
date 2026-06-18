import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="footer">
      <span className="f-logo">Mayve</span>
      <span className="f-copy">© 2026 Mayve. All rights reserved. Made to Order.</span>
      <div className="f-links">
        <Link to="/returns">Returns</Link>
        <Link to="/contact">Contact</Link>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
      </div>
    </footer>
  );
}
