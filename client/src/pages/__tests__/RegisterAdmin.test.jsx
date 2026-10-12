import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import RegisterAdmin from "../RegisterAdmin";
import { AuthProvider } from "../../contexts/AuthContext";
import { ToastProvider } from "../../contexts/ToastContext";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: { get: vi.fn(), post: vi.fn() }
}));

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={["/register/admin"]}>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route
                            path="/register/admin"
                            element={<RegisterAdmin />}
                        />
                        <Route
                            path="/login/admin"
                            element={<div>Admin Login Page</div>}
                        />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </MemoryRouter>
    );

const fillValidForm = async (user) => {
    await user.type(screen.getByLabelText(/username/i), "New Admin");
    await user.type(screen.getByLabelText(/^email$/i), "admin2@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "adminpassword");
    await user.type(
        screen.getByLabelText(/confirm password/i),
        "adminpassword"
    );
    await user.type(
        screen.getByLabelText(/registration secret/i),
        "test-admin-secret"
    );
};

describe("RegisterAdmin page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("requires the administrator registration secret", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText(/username/i), "New Admin");
        await user.type(
            screen.getByLabelText(/^email$/i),
            "admin2@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "adminpassword");
        await user.type(
            screen.getByLabelText(/confirm password/i),
            "adminpassword"
        );
        await user.click(screen.getByRole("button", { name: /register/i }));

        expect(
            await screen.findByText(/all fields are required/i)
        ).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    test("submits the admin secret to the backend", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderPage();
        await fillValidForm(user);

        await user.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => expect(api.post).toHaveBeenCalled());

        expect(api.post).toHaveBeenCalledWith("/auth/register/admin", {
            username: "New Admin",
            email: "admin2@example.com",
            password: "adminpassword",
            adminSecret: "test-admin-secret"
        });
    });

    test("redirects to the admin login after registering", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderPage();
        await fillValidForm(user);

        await user.click(screen.getByRole("button", { name: /register/i }));

        expect(await screen.findByText("Admin Login Page")).toBeInTheDocument();
    });

    test("surfaces a rejected secret from the backend", async () => {
        const user = userEvent.setup();
        api.post.mockRejectedValueOnce({
            response: {
                data: {
                    message: "Invalid administrator registration secret."
                }
            }
        });

        renderPage();
        await fillValidForm(user);

        await user.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/invalid administrator registration secret/i)
            ).toBeInTheDocument();
        });
    });
});
