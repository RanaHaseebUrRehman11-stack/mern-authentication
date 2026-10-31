import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Logo from "../ui/Logo";
import { Alert } from "../ui/Feedback";

const DEFAULT_POINTS = [
    "One secure workspace per role",
    "Every service request tracked end to end",
    "Built for owners, workshops and operations"
];

function AuthLayout({
    icon: Icon,
    title,
    subtitle,
    note,
    children,
    footer,
    visualTitle = "Service operations, with a clearer point of view.",
    visualText = "Sign in to the workspace built around your role, with only the tools and information you need to keep vehicles moving.",
    points = DEFAULT_POINTS
}) {
    return (
        <div className="auth-page">
            <aside className="auth-visual">
                <div className="auth-visual-grid" aria-hidden="true" />
                <div className="auth-visual-orbit auth-visual-orbit-one" aria-hidden="true" />
                <div className="auth-visual-orbit auth-visual-orbit-two" aria-hidden="true" />

                <Link to="/" className="auth-visual-brand">
                    <Logo />
                </Link>

                <div className="auth-visual-content">
                    <span className="eyebrow">TorqueDesk access</span>
                    <h2>{visualTitle}</h2>
                    <p>{visualText}</p>
                    <ul className="auth-points">
                        {points.map((point) => (
                            <li key={point}>
                                <span>
                                    <Check size={14} strokeWidth={2.6} />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="auth-visual-foot">
                    <span className="status-dot" aria-hidden="true" />
                    Secure, role-based access
                </div>
            </aside>

            <div className="auth-panel">
                <div className="auth-card">
                    <Link to="/" className="auth-mobile-brand">
                        <Logo />
                    </Link>

                    <div className="auth-header">
                        {Icon && (
                            <span className="auth-icon" aria-hidden="true">
                                <Icon size={21} strokeWidth={1.9} />
                            </span>
                        )}
                        <h1 className="auth-title">{title}</h1>
                        <p className="auth-subtitle">{subtitle}</p>
                    </div>

                    {note && <Alert type="info">{note}</Alert>}

                    {children}

                    {footer}
                </div>

                <p className="auth-legal">
                    Protected by role-based access and secure sessions.
                </p>
            </div>
        </div>
    );
}

export default AuthLayout;
