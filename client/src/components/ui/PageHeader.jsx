function PageHeader({ eyebrow, title, subtitle, actions }) {
    return (
        <header className="page-head">
            <div className="page-head-main">
                {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="page-head-actions">{actions}</div>}
        </header>
    );
}

export default PageHeader;
