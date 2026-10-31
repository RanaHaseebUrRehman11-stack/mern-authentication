import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    CarFront,
    ChartColumnIncreasing,
    ChevronDown,
    ClipboardList,
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    UserRound,
    Users,
    Wrench,
    X
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { roleHome, roleLabel } from "../../utils/roles";
import Logo from "../ui/Logo";

const NAVIGATION = {
    user: [
        {
            label: "Workspace",
            items: [
                { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { to: "/vehicles", label: "My Vehicles", icon: CarFront },
                {
                    to: "/service-requests",
                    label: "Service Requests",
                    icon: ClipboardList
                },
                { to: "/history", label: "Service History", icon: History }
            ]
        },
        {
            label: "Account",
            items: [{ to: "/profile", label: "Profile", icon: UserRound }]
        }
    ],
    mechanic: [
        {
            label: "Workspace",
            items: [
                { to: "/mechanic", label: "Dashboard", icon: LayoutDashboard },
                { to: "/mechanic/jobs", label: "My Jobs", icon: Wrench }
            ]
        },
        {
            label: "Account",
            items: [
                {
                    to: "/mechanic/profile",
                    label: "Profile",
                    icon: UserRound
                }
            ]
        }
    ],
    admin: [
        {
            label: "Control centre",
            items: [
                {
                    to: "/admin",
                    label: "Overview",
                    icon: ChartColumnIncreasing
                },
                { to: "/admin/users", label: "Users", icon: Users },
                { to: "/admin/mechanics", label: "Mechanics", icon: Wrench },
                {
                    to: "/admin/requests",
                    label: "Service Requests",
                    icon: ClipboardList
                }
            ]
        }
    ]
};

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const role = user?.role || "user";
    const sections = NAVIGATION[role] || NAVIGATION.user;
    const home = roleHome(role);
    const allItems = sections.flatMap((section) => section.items);
    const current =
        allItems.find((item) =>
            item.to === home
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
        ) || allItems[0];

    useEffect(() => {
        const handleClick = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleKey = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
                setMobileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const avatarLetter = (user?.username || "A").charAt(0).toUpperCase();

    return (
        <div
            className={`dashboard-shell ${collapsed ? "is-collapsed" : ""}`}
        >
            <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
                <div className="sidebar-head">
                    <NavLink
                        to={home}
                        className="sidebar-brand"
                        onClick={() => setMobileOpen(false)}
                    >
                        <Logo compact={collapsed} />
                    </NavLink>
                    <button
                        type="button"
                        className="sidebar-collapse"
                        onClick={() => setCollapsed((value) => !value)}
                        aria-label={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        title={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                    >
                        {collapsed ? (
                            <PanelLeftOpen size={17} />
                        ) : (
                            <PanelLeftClose size={17} />
                        )}
                    </button>
                    <button
                        type="button"
                        className="sidebar-mobile-close"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="sidebar-role">
                    <span className="sidebar-role-dot" aria-hidden="true" />
                    <span className="sidebar-role-text">{roleLabel(role)}</span>
                </div>

                <nav className="sidebar-nav" aria-label="Workspace navigation">
                    {sections.map((section) => (
                        <div className="sidebar-section" key={section.label}>
                            <span className="sidebar-section-label">
                                {section.label}
                            </span>
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === home}
                                        className={({ isActive }) =>
                                            `sidebar-link ${
                                                isActive ? "active" : ""
                                            }`
                                        }
                                        title={collapsed ? item.label : undefined}
                                        onClick={() => {
                                            setMobileOpen(false);
                                            setProfileOpen(false);
                                        }}
                                    >
                                        <Icon
                                            size={19}
                                            strokeWidth={1.9}
                                            aria-hidden="true"
                                        />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-profile">
                        <span className="avatar avatar-sm">{avatarLetter}</span>
                        <div className="sidebar-profile-text">
                            <strong>{user?.username || "Account"}</strong>
                            <span>{roleLabel(role)}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title="Sign out"
                    >
                        <LogOut size={18} strokeWidth={1.9} />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {mobileOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="topbar-menu"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="topbar-context">
                            <span>{roleLabel(role)}</span>
                            <strong>{current?.label || "Workspace"}</strong>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <span className="topbar-date">
                            {new Date().toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                            })}
                        </span>

                        <div className="profile-menu" ref={profileRef}>
                            <button
                                type="button"
                                className="profile-trigger"
                                aria-expanded={profileOpen}
                                aria-haspopup="menu"
                                onClick={() =>
                                    setProfileOpen((value) => !value)
                                }
                            >
                                <span className="avatar avatar-sm">
                                    {avatarLetter}
                                </span>
                                <span className="profile-trigger-text">
                                    <strong>{user?.username || "Account"}</strong>
                                    <span>{roleLabel(role)}</span>
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={profileOpen ? "rotated" : ""}
                                    aria-hidden="true"
                                />
                            </button>

                            {profileOpen && (
                                <div className="profile-dropdown" role="menu">
                                    <div className="profile-dropdown-head">
                                        <span className="avatar">
                                            {avatarLetter}
                                        </span>
                                        <div>
                                            <strong>
                                                {user?.username || "Account"}
                                            </strong>
                                            <span>{user?.email}</span>
                                        </div>
                                    </div>
                                    {role !== "admin" && (
                                        <NavLink
                                            to={
                                                role === "mechanic"
                                                    ? "/mechanic/profile"
                                                    : "/profile"
                                            }
                                            className="profile-dropdown-item"
                                            role="menuitem"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <UserRound size={16} />
                                            View profile
                                        </NavLink>
                                    )}
                                    <button
                                        type="button"
                                        className="profile-dropdown-item danger"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>

                <footer className="dashboard-footer">
                    <span>TorqueDesk service operations</span>
                    <span className="footer-status">
                        <span className="status-dot" aria-hidden="true" />
                        Secure session active
                    </span>
                </footer>
            </div>
        </div>
    );
}

export default DashboardLayout;
