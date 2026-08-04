import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/mayve-logo.png.asset.json";

const links = [
  { to: "/", label: "Home", exact: true },
  { to: "/shop", label: "Shop", exact: false },
  { to: "/tee", label: "Mayve Tee", exact: false },
  { to: "/bespoke", label: "Bespoke Portfolio", exact: false },
  { to: "/about", label: "About Us", exact: false },
  { to: "/returns", label: "Returns", exact: false },
  { to: "/contact", label: "Contact", exact: false },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo" aria-label="Mayve home" onClick={() => setOpen(false)}>
        <img src={logo.url} alt="Mayve" className="nav-logo-img" />
      </Link>
      <ul className="nav-center">
        <li><Link to="/" activeProps={{ className: "active" }} activeOptions={{ exact: true }}>Home</Link></li>
        <li><Link to="/shop" activeProps={{ className: "active" }}>Shop</Link></li>
        <li><Link to="/tee" activeProps={{ className: "active" }}>Mayve Tee</Link></li>
        <li><Link to="/bespoke" activeProps={{ className: "active" }}>Bespoke Portfolio</Link></li>
        <li><Link to="/about" activeProps={{ className: "active" }}>About Us</Link></li>
      </ul>
      <div className="nav-right">
        <Link to="/returns">Returns</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <button
        className="nav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
      </button>

      <div className={`nav-drawer${open ? " open" : ""}`}>
        <ul>
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeProps={{ className: "active" }}
                activeOptions={l.exact ? { exact: true } : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
