import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CarFront,
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
    Wrench
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import AuthLayout from "../components/auth/AuthLayout";
import { roleHome, roleLabel } from "../utils/roles";
import "../styles/auth.css";

const ROLE_CONTENT = {
    mechanic: {
        icon: Wrench,
        title: "Mechanic Login",
        subtitle: "Sign in to manage your assigned jobs",
        note: "New mechanic accounts must be approved by an administrator before signing in. If your account is pending, please check back later."
    },
    admin: {
        icon: ShieldCheck,
        title: "Administrator Login",
        subtitle: "Restricted access for administrators",
        note: "Administrator accounts are provisioned by the system operator. New administrators can self-register with the administrator registration secret."
    }
};

const DEFAULT_CONTENT = {
    icon: LockKeyhole,
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

    const visualPoints = isOwnerLogin
        ? [
              "View every vehicle on your account",
              "Track requests from pending to complete",
              "A permanent record of completed work"
          ]
        : [
              "A workspace scoped to your role",
              "Secure, session-based sign-in",
              "Only the information you need"
          ];

    return (
        <AuthLayout
            icon={content.icon}
            title={content.title}
            subtitle={content.subtitle}
            note={content.note}
            visualTitle={
                isOwnerLogin
                    ? "Your vehicles, services and history — in one place."
                    : "The right workspace, with the right level of access."
            }
            visualText={
                isOwnerLogin
                    ? "Pick up where you left off, request the service you need and follow every update without chasing anyone."
                    : "Sign in to a focused workspace with role-based access and a clear view of the work in front of you."
            }
            points={visualPoints}
            footer={
                isOwnerLogin ? (
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
                )
            }
        >
            <form className="auth-form" onSubmit={handleLogin} noValidate>
                <Alert type="error">{error}</Alert>

                <Field label="Email" htmlFor="login-email">
                    <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="input-action"
                            aria-label={
                                showPassword
                                    ? "Hide characters"
                                    : "Show characters"
                            }
                            title={
                                showPassword
                                    ? "Hide characters"
                                    : "Show characters"
                            }
                            onClick={() =>
                                setShowPassword((value) => !value)
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={17} strokeWidth={1.9} />
                            ) : (
                                <Eye size={17} strokeWidth={1.9} />
                            )}
                        </button>
                    </div>
                </Field>

                <Button
                    type="submit"
                    loading={loading}
                    className="btn-block btn-lg"
                >
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </form>

            <div className="auth-switch">
                <span>Not your workspace?</span>
                <div className="auth-switch-links">
                    <Link to="/login" className="auth-switch-link">
                        <CarFront size={14} strokeWidth={2} aria-hidden="true" />
                        Owner
                    </Link>
                    <Link to="/login/mechanic" className="auth-switch-link">
                        <Wrench size={14} strokeWidth={2} aria-hidden="true" />
                        Mechanic
                    </Link>
                    <Link to="/login/admin" className="auth-switch-link">
                        <ShieldCheck
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        Admin
                    </Link>
                </div>
            </div>

            <Link to="/" className="auth-back">
                <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
                Back to home
            </Link>
        </AuthLayout>
    );
}

export default Login;
