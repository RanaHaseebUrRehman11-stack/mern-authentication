export function Spinner({ label = "Loading..." }) {
    return (
        <div className="spinner-wrap">
            <span className="spinner" aria-hidden="true" />
            <span className="spinner-label">{label}</span>
        </div>
    );
}

export function FullPageLoader({ label = "Loading..." }) {
    return (
        <div className="full-page-loader">
            <Spinner label={label} />
        </div>
    );
}

export function EmptyState({ title, message, action }) {
    return (
        <div className="empty-state">
            <h3>{title}</h3>
            {message && <p>{message}</p>}
            {action}
        </div>
    );
}

export function Alert({ type = "info", children }) {
    if (!children) return null;

    return (
        <div className={`alert alert-${type}`} role="alert">
            {children}
        </div>
    );
}
