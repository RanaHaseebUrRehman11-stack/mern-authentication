import CountUp from "./CountUp";

export function Card({
    title,
    subtitle,
    actions,
    icon: Icon,
    children,
    className = "",
    bodyClassName = "",
    as: Tag = "section"
}) {
    return (
        <Tag className={`card ${className}`.trim()}>
            {(title || actions) && (
                <header className="card-header">
                    <div className="card-heading">
                        {Icon && (
                            <span className="card-icon" aria-hidden="true">
                                <Icon size={17} strokeWidth={2} />
                            </span>
                        )}
                        <div>
                            {title && <h2 className="card-title">{title}</h2>}
                            {subtitle && (
                                <p className="card-subtitle">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </header>
            )}
            <div className={`card-body ${bodyClassName}`.trim()}>{children}</div>
        </Tag>
    );
}

export function StatCard({ label, value, accent = "blue", icon: Icon, hint }) {
    return (
        <div className={`stat-card accent-${accent}`}>
            <div className="stat-card-top">
                <span className="stat-label">{label}</span>
                {Icon && (
                    <span className="stat-icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={2} />
                    </span>
                )}
            </div>
            <span className="stat-value">
                <CountUp value={value} />
            </span>
            {hint && <span className="stat-hint">{hint}</span>}
        </div>
    );
}
