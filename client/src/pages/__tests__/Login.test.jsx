import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import Login from "../login";
import { AuthProvider } from "../../contexts/AuthContext";
import { ToastProvider } from "../../contexts/ToastContext";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: { get: vi.fn(), post: vi.fn() }
}));

const renderLogin = (path = "/login") =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/login/mechanic"
                            element={<Login expectedRole="mechanic" />}
                        />
                        <Route
                            path="/login/admin"
                            element={<Login expectedRole="admin" />}
                        />
                        <Route
                            path="/dashboard"
                            element={<div>Dashboard Page</div>}
                        />
                        <Route path="/admin" element={<div>Admin Page</div>} />
                        <Route
                            path="/mechanic"
                            element={<div>Mechanic Page</div>}
                        />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </MemoryRouter>
    );

describe("Login page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("shows a validation error when submitted empty", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(
            await screen.findByText(/enter both email and password/i)
        ).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    test("redirects a normal user to the dashboard on success", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({
            data: {
                token: "test-token",
                user: {
                    id: "1",
                    username: "User",
                    email: "user@example.com",
                    role: "user"
                }
            }
        });

        renderLogin();

        await user.type(screen.getByLabelText(/email/i), "user@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBe("test-token");
    });

    test("redirects an administrator to the admin area", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({
            data: {
                token: "admin-token",
                user: {
                    id: "2",
                    username: "Admin",
                    email: "admin@example.com",
                    role: "admin"
                }
            }
        });

        renderLogin();

        await user.type(screen.getByLabelText(/email/i), "admin@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText("Admin Page")).toBeInTheDocument();
    });

    test("redirects a mechanic to the mechanic area", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({
            data: {
                token: "mechanic-token",
                user: {
                    id: "3",
                    username: "Mech",
                    email: "mech@example.com",
                    role: "mechanic"
                }
            }
        });

        renderLogin();

        await user.type(screen.getByLabelText(/email/i), "mech@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText("Mechanic Page")).toBeInTheDocument();
    });

    test("shows the dedicated mechanic login context", () => {
        renderLogin("/login/mechanic");

        expect(
            screen.getByRole("heading", { name: /mechanic login/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/approved by an administrator/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /register/i })
        ).toHaveAttribute("href", "/register/mechanic");
    });

    test("shows the dedicated admin login context", () => {
        renderLogin("/login/admin");

        expect(
            screen.getByRole("heading", { name: /administrator login/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/registration secret/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /register/i })
        ).toHaveAttribute("href", "/register/admin");
    });

    test("shows the pending-approval message for a mechanic", async () => {
        const user = userEvent.setup();
        api.post.mockRejectedValueOnce({
            response: {
                data: {
                    message:
                        "Your mechanic account is pending administrator approval.",
                    code: "MECHANIC_PENDING"
                }
            }
        });

        renderLogin("/login/mechanic");

        await user.type(screen.getByLabelText(/email/i), "mech@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/pending administrator approval/i)
            ).toBeInTheDocument();
        });
    });

    test("routes a non-admin who used the admin login to their own dashboard", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({
            data: {
                token: "user-token",
                user: {
                    id: "1",
                    username: "User",
                    email: "user@example.com",
                    role: "user"
                }
            }
        });

        renderLogin("/login/admin");

        await user.type(screen.getByLabelText(/email/i), "user@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /login/i }));

        // Never granted admin access — sent to the owner dashboard instead.
        expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        expect(screen.queryByText("Admin Page")).not.toBeInTheDocument();
    });

    test("shows the API error message on failure", async () => {
        const user = userEvent.setup();
        api.post.mockRejectedValueOnce({
            response: { data: { message: "Invalid email or password" } }
        });

        renderLogin();

        await user.type(screen.getByLabelText(/email/i), "user@example.com");
        await user.type(screen.getByLabelText(/password/i), "wrong");
        await user.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(
                screen.getByText("Invalid email or password")
            ).toBeInTheDocument();
        });
    });
});
