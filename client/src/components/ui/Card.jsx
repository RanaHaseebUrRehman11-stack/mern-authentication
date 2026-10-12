export function Card({ title, actions, children, className = "" }) {
    return (
        <section className={`card ${className}`.trim()}>
            {(title || actions) && (
                <header className="card-header">
                    {title && <h2 className="card-title">{title}</h2>}
                    {actions && <div className="card-actions">{actions}</div>}
                </header>
            )}
            <div className="card-body">{children}</div>
        </section>
    );
}

export function StatCard({ label, value, accent = "blue" }) {
    return (
        <div className={`stat-card accent-${accent}`}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}
