import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import { roleHome, roleLabel } from "../utils/roles";
import "../styles/auth.css";

const ROLE_CONTENT = {
    mechanic: {
        icon: "\uD83D\uDD27",
        title: "Mechanic Login",
        subtitle: "Sign in to manage your assigned jobs",
        note: "New mechanic accounts must be approved by an administrator before signing in. If your account is pending, please check back later."
    },
    admin: {
        icon: "\uD83D\uDEE1",
        title: "Administrator Login",
        subtitle: "Restricted access for administrators",
        note: "Administrator accounts are provisioned by the system operator. New administrators can self-register with the administrator registration secret."
    }
};

const DEFAULT_CONTENT = {
    icon: "\uD83D\uDD12",
    title: "Welcome back",
    subtitle: "Login to continue",
    note: null
};

function Login({ expectedRole }) {
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const content = ROLE_CONTENT[expectedRole] || DEFAULT_CONTENT;
    const isOwnerLogin = !expectedRole || expectedRole === "user";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            const user = await login(email, password);

            // The backend decides the real role. If the account signed in on a
            // role-specific page does not match, explain and route to the
            // dashboard the account actually owns (never the requested one).
            if (expectedRole && user.role !== expectedRole) {
                toast.info(
                    `You are signed in as ${roleLabel(
                        user.role
                    )}. Opening your dashboard.`
                );
            }

            navigate(roleHome(user.role), { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon" aria-hidden="true">
                        {content.icon}
                    </div>
                    <h1 className="auth-title">{content.title}</h1>
                    <p className="auth-subtitle">{content.subtitle}</p>
                </div>

                {content.note && (
                    <Alert type="info">{content.note}</Alert>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <Alert type="error">{error}</Alert>

                    <Field label="Email" htmlFor="login-email">
                        <Input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </Field>

                    <Field label="Password" htmlFor="login-password">
                        <div className="input-with-action">
                            <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="input-action"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </Field>

                    <Button type="submit" loading={loading} className="btn-block">
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                {isOwnerLogin ? (
                    <p className="auth-footer">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="auth-link">
                            Register
                        </Link>
                    </p>
                ) : (
                    <p className="auth-footer">
                        Need an account?{" "}
                        <Link
                            to={`/register/${expectedRole}`}
                            className="auth-link"
                        >
                            Register
                        </Link>
                        {" · "}
                        <Link to="/" className="auth-link">
                            All sign-in options
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;
