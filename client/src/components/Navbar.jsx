import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "./ui/Logo";

const PUBLIC_LINKS = [
    { label: "Platform", to: "/#platform" },
    { label: "How it works", to: "/#how-it-works" },
    { label: "Portals", to: "/#portals" },
    { label: "FAQ", to: "/#faq" }
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="public-nav">
            <div className="public-nav-inner">
                <Link
                    to="/"
                    className="public-brand"
                    aria-label="TorqueDesk home"
                    onClick={closeMenu}
                >
                    <Logo />
                </Link>

                <nav className="public-nav-links" aria-label="Main navigation">
                    {PUBLIC_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className="public-nav-link"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="public-nav-actions">
                    <Link to="/login" className="btn btn-ghost btn-sm public-signin">
                        Sign in
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-sm">
                        Get started
                        <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                </div>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
                <nav aria-label="Mobile navigation">
                    {PUBLIC_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className="mobile-nav-link"
                            onClick={closeMenu}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="mobile-nav-actions">
                    <Link
                        to="/login"
                        className="btn btn-secondary btn-md"
                        onClick={closeMenu}
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/register"
                        className="btn btn-primary btn-md"
                        onClick={closeMenu}
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
