import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, UserRound } from "lucide-react";

import api from "../services/api";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import AuthLayout from "../components/auth/AuthLayout";
import { useToast } from "../contexts/ToastContext";
import "../styles/auth.css";

function Register() {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
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

        if (!username || !email || !form.password) {
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
            await api.post("/auth/register", {
                username,
                email,
                password: form.password
            });

            toast.success("Account created successfully. Please log in.");
            navigate("/login");
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
            icon={UserRound}
            title="Create account"
            subtitle="Register to get started"
            visualTitle="A better way to look after every vehicle."
            visualText="Create your owner workspace to manage vehicles, request services and keep a complete history of work completed."
            points={[
                "Register vehicles in seconds",
                "Request the exact service you need",
                "Follow every request to completion"
            ]}
            footer={
                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Log in
                    </Link>
                </p>
            }
        >
            <form className="auth-form" onSubmit={handleRegister} noValidate>
                <Alert type="error">{error}</Alert>

                <Field label="Username" htmlFor="reg-username">
                    <Input
                        id="reg-username"
                        type="text"
                        placeholder="How should we address you?"
                        value={form.username}
                        onChange={update("username")}
                    />
                </Field>

                <Field label="Email" htmlFor="reg-email">
                    <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update("email")}
                    />
                </Field>

                <Field
                    label="Password"
                    htmlFor="reg-password"
                    hint="At least 6 characters"
                >
                    <div className="input-with-action">
                        <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={update("password")}
                        />
                        {passwordToggle}
                    </div>
                </Field>

                <Field label="Confirm password" htmlFor="reg-confirm">
                    <Input
                        id="reg-confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
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

export default Register;
