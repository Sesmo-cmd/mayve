import { Link } from "@tanstack/react-router";
import logo from "@/assets/mayve-logo.png.asset.json";

export function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo" aria-label="Mayve home">
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
    </nav>
  );
}
