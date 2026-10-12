import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoader } from "./ui/Feedback";
import { roleHome } from "../utils/roles";

function ProtectedRoute({ children, role }) {
    const { initializing, isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (initializing) {
        return <FullPageLoader label="Restoring session..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Backend authorization remains authoritative; this is a UX guard only.
    // Send the user to their OWN dashboard so a mismatch can never loop.
    if (role && user && user.role !== role) {
        return <Navigate to={roleHome(user.role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
