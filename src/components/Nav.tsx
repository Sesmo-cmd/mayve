import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <nav className="nav nav-bold">
      <Link to="/" className="nav-logo-bold">MAYVE</Link>
      <ul className="nav-center">
        <li><Link to="/shop" activeProps={{ className: "active" }}>Shop</Link></li>
        <li><Link to="/tee" activeProps={{ className: "active" }}>Tee</Link></li>
        <li><Link to="/bespoke" activeProps={{ className: "active" }}>Bespoke</Link></li>
        <li><Link to="/about" activeProps={{ className: "active" }}>About</Link></li>
      </ul>
      <div className="nav-right">
        <Link to="/contact">Contact</Link>
        <Link to="/shop" className="nav-bag">Bag</Link>
      </div>
    </nav>
  );
}
