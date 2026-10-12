import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

const renderAt = (ui, path = "/protected") =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                <Route path="/admin" element={<div>Admin Page</div>} />
                <Route path="/mechanic" element={<div>Mechanic Page</div>} />
                <Route path="/protected" element={ui} />
            </Routes>
        </MemoryRouter>
    );

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("redirects unauthenticated users to login", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: false,
            user: null
        });

        renderAt(
            <ProtectedRoute>
                <div>Secret</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    test("renders children for authenticated users", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "user" }
        });

        renderAt(
            <ProtectedRoute>
                <div>Secret</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Secret")).toBeInTheDocument();
    });

    test("redirects non-admins away from admin routes", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "user" }
        });

        renderAt(
            <ProtectedRoute role="admin">
                <div>Admin Only</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    test("redirects admins away from owner-only routes to the admin area", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "admin" }
        });

        renderAt(
            <ProtectedRoute role="user">
                <div>Owner Only</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Admin Page")).toBeInTheDocument();
    });

    test("redirects mechanics away from owner-only routes to the mechanic area", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "mechanic" }
        });

        renderAt(
            <ProtectedRoute role="user">
                <div>Owner Only</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Mechanic Page")).toBeInTheDocument();
    });

    test("renders admin routes for administrators", () => {
        useAuth.mockReturnValue({
            initializing: false,
            isAuthenticated: true,
            user: { role: "admin" }
        });

        renderAt(
            <ProtectedRoute role="admin">
                <div>Admin Only</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Admin Only")).toBeInTheDocument();
    });

    test("shows a loader while the session is being restored", () => {
        useAuth.mockReturnValue({
            initializing: true,
            isAuthenticated: false,
            user: null
        });

        renderAt(
            <ProtectedRoute>
                <div>Secret</div>
            </ProtectedRoute>
        );

        expect(screen.getByText(/restoring session/i)).toBeInTheDocument();
    });
});
