import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

import api from "../services/api";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import AuthLayout from "../components/auth/AuthLayout";
import { useToast } from "../contexts/ToastContext";
import "../styles/auth.css";

const EMPTY_FORM = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminSecret: ""
};

function RegisterAdmin() {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (key) => (event) =>
        setForm((current) => ({ ...current, [key]: event.target.value }));

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");

        const username = form.username.trim();
        const email = form.email.trim();
        const adminSecret = form.adminSecret.trim();

        if (!username || !email || !form.password || !adminSecret) {
            setError("All fields are required.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register/admin", {
                username,
                email,
                password: form.password,
                adminSecret
            });

            toast.success(
                "Administrator account created. Please sign in."
            );
            navigate("/login/admin");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.[0] ||
                    "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const passwordToggle = (
        <button
            type="button"
            className="input-action"
            aria-label={showPassword ? "Hide characters" : "Show characters"}
            title={showPassword ? "Hide characters" : "Show characters"}
            onClick={() => setShowPassword((value) => !value)}
        >
            {showPassword ? (
                <EyeOff size={17} strokeWidth={1.9} />
            ) : (
                <Eye size={17} strokeWidth={1.9} />
            )}
        </button>
    );

    return (
        <AuthLayout
            icon={ShieldCheck}
            title="Administrator registration"
            subtitle="Restricted provisioning of administrator accounts"
            note="This page requires the administrator registration secret provided by the system operator. Registration is disabled when no secret is configured."
            visualTitle="Operational clarity, with controlled access."
            visualText="Provision a control-centre account to manage users, review workshop access and keep service activity moving."
            points={[
                "Oversee users, vehicles and requests",
                "Review and approve workshop accounts",
                "See the platform at a glance"
            ]}
            footer={
                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login/admin" className="auth-link">
                        Admin login
                    </Link>
                </p>
            }
        >
            <form className="auth-form" onSubmit={handleRegister} noValidate>
                <Alert type="error">{error}</Alert>

                <Field label="Username" htmlFor="ar-username">
                    <Input
                        id="ar-username"
                        type="text"
                        placeholder="Enter username"
                        value={form.username}
                        onChange={update("username")}
                    />
                </Field>

                <Field label="Email" htmlFor="ar-email">
                    <Input
                        id="ar-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update("email")}
                    />
                </Field>

                <Field
                    label="Password"
                    htmlFor="ar-password"
                    hint="At least 6 characters"
                >
                    <div className="input-with-action">
                        <Input
                            id="ar-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={update("password")}
                        />
                        {passwordToggle}
                    </div>
                </Field>

                <Field label="Confirm password" htmlFor="ar-confirm">
                    <Input
                        id="ar-confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
                    />
                </Field>

                <Field
                    label="Administrator registration secret"
                    htmlFor="ar-secret"
                    hint="Provided by the system operator"
                >
                    <Input
                        id="ar-secret"
                        type="password"
                        autoComplete="off"
                        placeholder="Enter registration secret"
                        value={form.adminSecret}
                        onChange={update("adminSecret")}
                    />
                </Field>

                <Button
                    type="submit"
                    loading={loading}
                    className="btn-block btn-lg"
                >
                    {loading ? "Creating account..." : "Register"}
                </Button>
            </form>

            <Link to="/" className="auth-back">
                <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
                Back to home
            </Link>
        </AuthLayout>
    );
}

export default RegisterAdmin;
