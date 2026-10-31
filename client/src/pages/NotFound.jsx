import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

function NotFound() {
    return (
        <div className="not-found">
            <span className="not-found-code" aria-hidden="true">
                404
            </span>
            <span className="not-found-icon" aria-hidden="true">
                <Compass size={26} strokeWidth={1.8} />
            </span>
            <h1 className="page-title">Page not found</h1>
            <p className="page-subtitle">
                The page you are looking for does not exist or has moved.
            </p>
            <Link to="/" className="btn btn-primary btn-md">
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                Return home
            </Link>
        </div>
    );
}

export default NotFound;
