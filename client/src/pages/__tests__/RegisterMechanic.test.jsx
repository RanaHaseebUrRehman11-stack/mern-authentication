import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import RegisterMechanic from "../RegisterMechanic";
import { AuthProvider } from "../../contexts/AuthContext";
import { ToastProvider } from "../../contexts/ToastContext";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
    default: { get: vi.fn(), post: vi.fn() }
}));

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={["/register/mechanic"]}>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route
                            path="/register/mechanic"
                            element={<RegisterMechanic />}
                        />
                        <Route
                            path="/login/mechanic"
                            element={<div>Mechanic Login Page</div>}
                        />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </MemoryRouter>
    );

const fillValidForm = async (user) => {
    await user.type(screen.getByLabelText(/full name/i), "Self Mechanic");
    await user.type(screen.getByLabelText(/^email$/i), "self@example.com");
    await user.type(screen.getByLabelText(/^phone$/i), "5551234567");
    await user.type(screen.getByLabelText(/specialization/i), "Brakes");
    await user.type(screen.getByLabelText(/experience/i), "3");
    await user.type(screen.getByLabelText(/^password$/i), "mechanic123");
    await user.type(
        screen.getByLabelText(/confirm password/i),
        "mechanic123"
    );
};

describe("RegisterMechanic page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("blocks submission when passwords do not match", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText(/full name/i), "Self Mechanic");
        await user.type(screen.getByLabelText(/^email$/i), "self@example.com");
        await user.type(screen.getByLabelText(/^phone$/i), "5551234567");
        await user.type(screen.getByLabelText(/specialization/i), "Brakes");
        await user.type(screen.getByLabelText(/experience/i), "3");
        await user.type(screen.getByLabelText(/^password$/i), "mechanic123");
        await user.type(
            screen.getByLabelText(/confirm password/i),
            "different"
        );
        await user.click(
            screen.getByRole("button", { name: /submit registration/i })
        );

        expect(
            await screen.findByText(/passwords do not match/i)
        ).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    test("submits the mechanic registration payload", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderPage();
        await fillValidForm(user);

        await user.click(
            screen.getByRole("button", { name: /submit registration/i })
        );

        await waitFor(() => expect(api.post).toHaveBeenCalled());

        expect(api.post).toHaveBeenCalledWith("/auth/register/mechanic", {
            name: "Self Mechanic",
            email: "self@example.com",
            phone: "5551234567",
            specialization: "Brakes",
            experience: 3,
            password: "mechanic123"
        });

        const payload = api.post.mock.calls[0][1];
        expect(payload.role).toBeUndefined();
    });

    test("redirects to the mechanic login after registering", async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValueOnce({ data: { message: "ok" } });

        renderPage();
        await fillValidForm(user);

        await user.click(
            screen.getByRole("button", { name: /submit registration/i })
        );

        expect(
            await screen.findByText("Mechanic Login Page")
        ).toBeInTheDocument();
    });
});
