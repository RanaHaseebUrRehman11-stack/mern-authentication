import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import { useToast } from "../contexts/ToastContext";
import "../styles/auth.css";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    password: "",
    confirmPassword: ""
};

function RegisterMechanic() {
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

        const name = form.name.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();
        const specialization = form.specialization.trim();
        const experience = Number(form.experience);

        if (!name || !email || !phone || !specialization) {
            setError("All fields are required.");
            return;
        }

        if (!Number.isFinite(experience) || experience < 0) {
            setError("Experience must be a non-negative number.");
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
            await api.post("/auth/register/mechanic", {
                name,
                email,
                phone,
                specialization,
                experience,
                password: form.password
            });

            toast.success(
                "Registration submitted. An administrator must approve your account before you can sign in."
            );
            navigate("/login/mechanic");
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
                    <div className="auth-icon">&#128295;</div>
                    <h1 className="auth-title">Mechanic registration</h1>
                    <p className="auth-subtitle">
                        Apply for a mechanic account
                    </p>
                </div>

                <Alert type="info">
                    Your account will be reviewed by an administrator. You can
                    sign in once it is approved.
                </Alert>

                <form onSubmit={handleRegister} noValidate>
                    <Alert type="error">{error}</Alert>

                    <Field label="Full name" htmlFor="mr-name">
                        <Input
                            id="mr-name"
                            type="text"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={update("name")}
                        />
                    </Field>

                    <Field label="Email" htmlFor="mr-email">
                        <Input
                            id="mr-email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter email"
                            value={form.email}
                            onChange={update("email")}
                        />
                    </Field>

                    <Field label="Phone" htmlFor="mr-phone">
                        <Input
                            id="mr-phone"
                            type="tel"
                            placeholder="Contact number"
                            value={form.phone}
                            onChange={update("phone")}
                        />
                    </Field>

                    <Field
                        label="Specialization"
                        htmlFor="mr-specialization"
                    >
                        <Input
                            id="mr-specialization"
                            type="text"
                            placeholder="e.g. Engine, Brakes"
                            value={form.specialization}
                            onChange={update("specialization")}
                        />
                    </Field>

                    <Field
                        label="Experience (years)"
                        htmlFor="mr-experience"
                    >
                        <Input
                            id="mr-experience"
                            type="number"
                            min="0"
                            placeholder="e.g. 5"
                            value={form.experience}
                            onChange={update("experience")}
                        />
                    </Field>

                    <Field
                        label="Password"
                        htmlFor="mr-password"
                        hint="At least 6 characters"
                    >
                        <div className="input-with-action">
                            <Input
                                id="mr-password"
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

                    <Field label="Confirm password" htmlFor="mr-confirm">
                        <Input
                            id="mr-confirm"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={update("confirmPassword")}
                        />
                    </Field>

                    <Button
                        type="submit"
                        loading={loading}
                        className="btn-block"
                    >
                        {loading ? "Submitting..." : "Submit registration"}
                    </Button>
                </form>

                <p className="auth-footer">
                    Already approved?{" "}
                    <Link to="/login/mechanic" className="auth-link">
                        Mechanic login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterMechanic;
