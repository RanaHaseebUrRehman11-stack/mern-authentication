import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import Register from "../Register";
import { AuthProvider } from "../../contexts/AuthContext";
import { ToastProvider } from "../../contexts/ToastContext";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: { get: vi.fn(), post: vi.fn() }
}));

const renderRegister = () =>
    render(
        <MemoryRouter initialEntries={["/register"]}>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </MemoryRouter>
    );

describe("Register page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("blocks submission when passwords do not match", async () => {
        const user = userEvent.setup();
        renderRegister();

        await user.type(screen.getByLabelText(/username/i), "New User");
        await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
        await user.type(screen.getByLabelText(/^password$/i), "password123");
        await user.type(
            screen.getByLabelText(/confirm password/i),
            "different"
        );
        await user.click(screen.getByRole("button", { name: /register/i }));

        expect(
            await screen.findByText(/passwords do not match/i)
        ).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    test("registers and redirects to login on success", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderRegister();

        await user.type(screen.getByLabelText(/username/i), "New User");
        await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
        await user.type(screen.getByLabelText(/^password$/i), "password123");
        await user.type(
            screen.getByLabelText(/confirm password/i),
            "password123"
        );
        await user.click(screen.getByRole("button", { name: /register/i }));

        expect(await screen.findByText("Login Page")).toBeInTheDocument();
    });

    test("submits only username, email and password — never a role", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderRegister();

        await user.type(screen.getByLabelText(/username/i), "New User");
        await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
        await user.type(screen.getByLabelText(/^password$/i), "password123");
        await user.type(
            screen.getByLabelText(/confirm password/i),
            "password123"
        );
        await user.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => expect(api.post).toHaveBeenCalled());

        expect(api.post).toHaveBeenCalledWith("/auth/register", {
            username: "New User",
            email: "new@example.com",
            password: "password123"
        });

        const payload = api.post.mock.calls[0][1];
        expect(payload.role).toBeUndefined();
    });
});
