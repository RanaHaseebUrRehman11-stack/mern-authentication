import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Logo from "../ui/Logo";

function PublicFooter() {
    return (
        <footer className="public-footer">
            <div className="public-footer-inner">
                <div className="footer-brand">
                    <Logo />
                    <p>
                        A modern service operations platform for vehicle
                        owners, workshops and the teams that keep them moving.
                    </p>
                    <span className="footer-security">
                        <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />
                        Role-based access with secure sessions
                    </span>
                </div>

                <div className="footer-columns">
                    <div className="footer-column">
                        <h3>Platform</h3>
                        <Link to="/#platform">Capabilities</Link>
                        <Link to="/#how-it-works">How it works</Link>
                        <Link to="/#portals">Workspaces</Link>
                        <Link to="/#faq">FAQ</Link>
                    </div>

                    <div className="footer-column">
                        <h3>Access</h3>
                        <Link to="/login">Sign in</Link>
                        <Link to="/register">Create account</Link>
                        <Link to="/login/mechanic">Mechanic access</Link>
                        <Link to="/login/admin">Admin access</Link>
                    </div>

                    <div className="footer-column">
                        <h3>Account types</h3>
                        <Link to="/register">Vehicle owner</Link>
                        <Link to="/register/mechanic">Mechanic</Link>
                        <Link to="/register/admin">Administrator</Link>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <span>
                    &copy; {new Date().getFullYear()} TorqueDesk. Vehicle
                    service management, refined.
                </span>
                <span className="footer-status">
                    <span className="status-dot" aria-hidden="true" />
                    Service desk online
                </span>
            </div>
        </footer>
    );
}

export default PublicFooter;
