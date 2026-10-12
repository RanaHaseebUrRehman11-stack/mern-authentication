import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { AuthProvider, useAuth } from "../AuthContext";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: { get: vi.fn(), post: vi.fn() }
}));

function Probe() {
    const { isAuthenticated, isAdmin, user, login, initializing } = useAuth();

    return (
        <div>
            <span data-testid="auth">{String(isAuthenticated)}</span>
            <span data-testid="init">{String(initializing)}</span>
            <span data-testid="admin">{String(isAdmin)}</span>
            <span data-testid="user">{user?.username || "none"}</span>
            <button
                type="button"
                onClick={() => login("user@example.com", "password123")}
            >
                do-login
            </button>
        </div>
    );
}

const renderProbe = () =>
    render(
        <AuthProvider>
            <Probe />
        </AuthProvider>
    );

describe("AuthContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("starts unauthenticated without a token", async () => {
        renderProbe();

        await waitFor(() =>
            expect(screen.getByTestId("init")).toHaveTextContent("false")
        );
        expect(screen.getByTestId("auth")).toHaveTextContent("false");
    });

    test("login stores the token and user", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({
            data: {
                token: "token-123",
                user: {
                    id: "1",
                    username: "User",
                    email: "user@example.com",
                    role: "user"
                }
            }
        });

        renderProbe();

        await user.click(screen.getByRole("button", { name: "do-login" }));

        await waitFor(() =>
            expect(screen.getByTestId("auth")).toHaveTextContent("true")
        );
        expect(localStorage.getItem("token")).toBe("token-123");
        expect(screen.getByTestId("user")).toHaveTextContent("User");
    });

    test("restores the session from a stored token", async () => {
        localStorage.setItem("token", "stored-token");
        api.get.mockResolvedValueOnce({
            data: {
                user: {
                    id: "2",
                    username: "Admin",
                    email: "admin@example.com",
                    role: "admin"
                }
            }
        });

        renderProbe();

        await waitFor(() =>
            expect(screen.getByTestId("auth")).toHaveTextContent("true")
        );
        expect(screen.getByTestId("admin")).toHaveTextContent("true");
        expect(api.get).toHaveBeenCalledWith("/auth/profile");
    });
});
