import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="page not-found">
            <h1 className="page-title">404 — Page not found</h1>
            <p className="page-subtitle">
                The page you are looking for does not exist.
            </p>
            <Link to="/" className="link">
                Return home
            </Link>
        </div>
    );
}

export default NotFound;
