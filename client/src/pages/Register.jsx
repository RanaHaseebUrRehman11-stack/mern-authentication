import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
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

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">&#128100;</div>
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">Register to get started</p>
                </div>

                <form onSubmit={handleRegister} noValidate>
                    <Alert type="error">{error}</Alert>

                    <Field label="Username" htmlFor="reg-username">
                        <Input
                            id="reg-username"
                            type="text"
                            placeholder="Enter username"
                            value={form.username}
                            onChange={update("username")}
                        />
                    </Field>

                    <Field label="Email" htmlFor="reg-email">
                        <Input
                            id="reg-email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter email"
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
                                placeholder="Enter password"
                                value={form.password}
                                onChange={update("password")}
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

                    <Field
                        label="Confirm password"
                        htmlFor="reg-confirm"
                    >
                        <Input
                            id="reg-confirm"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={update("confirmPassword")}
                        />
                    </Field>

                    <Button type="submit" loading={loading} className="btn-block">
                        {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
