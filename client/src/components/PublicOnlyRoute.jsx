import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoader } from "./ui/Feedback";
import { roleHome } from "../utils/roles";

// Wraps public-only pages (login, register). An already-authenticated visitor is
// sent straight to their own dashboard, which prevents both "sign in again"
// confusion and any redirect loop between login pages and protected routes.
function PublicOnlyRoute({ children }) {
    const { initializing, isAuthenticated, user } = useAuth();

    if (initializing) {
        return <FullPageLoader label="Restoring session..." />;
    }

    if (isAuthenticated) {
        return <Navigate to={roleHome(user?.role)} replace />;
    }

    return children;
}

export default PublicOnlyRoute;
