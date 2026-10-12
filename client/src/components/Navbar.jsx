import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { roleHome } from "../utils/roles";

function Navbar() {
    const { isAuthenticated, isAdmin, isMechanic, user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate("/login");
    };

    const closeMenu = () => setMenuOpen(false);

    const linkClass = ({ isActive }) =>
        `nav-link ${isActive ? "active" : ""}`.trim();

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <NavLink
                    to={isAuthenticated ? roleHome(user?.role) : "/"}
                    onClick={closeMenu}
                >
                    Vehicle Service
                </NavLink>
            </div>

            <button
                type="button"
                className="nav-toggle"
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
                {isAuthenticated ? (
                    <>
                        {!isAdmin && !isMechanic && (
                            <>
                                <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
                                    Dashboard
                                </NavLink>
                                <NavLink to="/vehicles" className={linkClass} onClick={closeMenu}>
                                    Vehicles
                                </NavLink>
                                <NavLink to="/service-requests" className={linkClass} onClick={closeMenu}>
                                    Requests
                                </NavLink>
                                <NavLink to="/history" className={linkClass} onClick={closeMenu}>
                                    History
                                </NavLink>
                                <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                                    Profile
                                </NavLink>
                            </>
                        )}

                        {isMechanic && (
                            <>
                                <NavLink to="/mechanic" end className={linkClass} onClick={closeMenu}>
                                    Dashboard
                                </NavLink>
                                <NavLink to="/mechanic/jobs" className={linkClass} onClick={closeMenu}>
                                    My Jobs
                                </NavLink>
                                <NavLink to="/mechanic/profile" className={linkClass} onClick={closeMenu}>
                                    Profile
                                </NavLink>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <NavLink to="/admin" end className={linkClass} onClick={closeMenu}>
                                    Admin
                                </NavLink>
                                <NavLink to="/admin/users" className={linkClass} onClick={closeMenu}>
                                    Users
                                </NavLink>
                                <NavLink to="/admin/mechanics" className={linkClass} onClick={closeMenu}>
                                    Mechanics
                                </NavLink>
                                <NavLink to="/admin/requests" className={linkClass} onClick={closeMenu}>
                                    Service Requests
                                </NavLink>
                            </>
                        )}

                        <div className="nav-user">
                            <span className="nav-user-name">
                                {user?.username || "Account"}
                                {isAdmin && <span className="nav-role">admin</span>}
                                {isMechanic && <span className="nav-role">mechanic</span>}
                            </span>
                            <button
                                type="button"
                                className="nav-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <NavLink to="/" end className={linkClass} onClick={closeMenu}>
                            Sign in
                        </NavLink>
                        <NavLink to="/register" className={linkClass} onClick={closeMenu}>
                            Register
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
