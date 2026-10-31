import { AlertCircle, CheckCircle2, Info, Inbox } from "lucide-react";

const ALERT_ICONS = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info
};

export function Spinner({ label = "Loading..." }) {
    return (
        <div className="spinner-wrap" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span className="spinner-label">{label}</span>
        </div>
    );
}

export function FullPageLoader({ label = "Loading..." }) {
    return (
        <div className="full-page-loader">
            <div className="loader-orbit" aria-hidden="true">
                <span />
                <span />
            </div>
            <Spinner label={label} />
        </div>
    );
}

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
    return (
        <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
                <Icon size={24} strokeWidth={1.8} />
            </span>
            <h3>{title}</h3>
            {message && <p>{message}</p>}
            {action && <div className="empty-action">{action}</div>}
        </div>
    );
}

export function Alert({ type = "info", children }) {
    if (!children) return null;

    const Icon = ALERT_ICONS[type] || Info;

    return (
        <div className={`alert alert-${type}`} role="alert">
            <Icon size={17} strokeWidth={2} aria-hidden="true" />
            <span>{children}</span>
        </div>
    );
}

export function Skeleton({ width, height = 16, rounded = 8, className = "" }) {
    return (
        <span
            className={`skeleton ${className}`.trim()}
            style={{
                width: width || "100%",
                height,
                borderRadius: rounded
            }}
            aria-hidden="true"
        />
    );
}

export function SkeletonRows({ rows = 3 }) {
    return (
        <div className="skeleton-stack" aria-hidden="true">
            {Array.from({ length: rows }).map((_, index) => (
                <div className="skeleton-row" key={index}>
                    <Skeleton width="38%" height={13} />
                    <Skeleton width="20%" height={13} />
                </div>
            ))}
        </div>
    );
}
