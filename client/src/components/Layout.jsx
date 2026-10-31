import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import PublicFooter from "./navigation/PublicFooter";
import DashboardLayout from "./navigation/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoader } from "./ui/Feedback";

function Layout() {
    const { isAuthenticated, initializing } = useAuth();
    const { pathname } = useLocation();

    if (initializing) {
        return <FullPageLoader label="Restoring session..." />;
    }

    if (isAuthenticated) {
        return <DashboardLayout />;
    }

    const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isAuthRoute) {
        return <Outlet />;
    }

    return (
        <div className="public-shell">
            <div className="public-glow" aria-hidden="true" />
            <Navbar />
            <main className="public-main">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
}

export default Layout;
