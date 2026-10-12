import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PublicOnlyRoute from "../PublicOnlyRoute";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

const renderAt = (ui) =>
    render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/login" element={ui} />
                <Route path="/dashboard" element={<div>Owner Dashboard</div>} />
                <Route path="/mechanic" element={<div>Mechanic Dashboard</div>} />
                <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Routes>
        </MemoryRouter>
    );

describe("PublicOnlyRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders children for unauthenticated visitors", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: false,
            user: null
        });

        renderAt(
            <PublicOnlyRoute>
                <div>Login Form</div>
            </PublicOnlyRoute>
        );

        expect(screen.getByText("Login Form")).toBeInTheDocument();
    });

    test("redirects an authenticated owner to the owner dashboard", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "user" }
        });

        renderAt(
            <PublicOnlyRoute>
                <div>Login Form</div>
            </PublicOnlyRoute>
        );

        expect(screen.getByText("Owner Dashboard")).toBeInTheDocument();
    });

    test("redirects an authenticated mechanic to the mechanic dashboard", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "mechanic" }
        });

        renderAt(
            <PublicOnlyRoute>
                <div>Login Form</div>
            </PublicOnlyRoute>
        );

        expect(screen.getByText("Mechanic Dashboard")).toBeInTheDocument();
    });

    test("redirects an authenticated admin to the admin dashboard", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "admin" }
        });

        renderAt(
            <PublicOnlyRoute>
                <div>Login Form</div>
            </PublicOnlyRoute>
        );

        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    test("shows a loader while the session is being restored", () => {
        useAuth.mockReturnValue({
            initializing: true,
            isAuthenticated: false,
            user: null
        });

        renderAt(
            <PublicOnlyRoute>
                <div>Login Form</div>
            </PublicOnlyRoute>
        );

        expect(screen.getByText(/restoring session/i)).toBeInTheDocument();
    });
});
