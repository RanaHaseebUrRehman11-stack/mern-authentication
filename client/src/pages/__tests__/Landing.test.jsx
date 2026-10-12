import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import Landing from "../Landing";

const renderLanding = () =>
    render(
        <MemoryRouter initialEntries={["/"]}>
            <Landing />
        </MemoryRouter>
    );

describe("Landing page", () => {
    test("presents the three account options", () => {
        renderLanding();

        expect(
            screen.getByRole("heading", { name: /vehicle owner/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: /mechanic/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: /administrator/i })
        ).toBeInTheDocument();
    });

    test("offers owner login and registration", () => {
        renderLanding();

        expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
            "href",
            "/login"
        );
        expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
            "href",
            "/register"
        );
    });

    test("offers dedicated mechanic and admin logins", () => {
        renderLanding();

        expect(
            screen.getByRole("link", { name: /mechanic login/i })
        ).toHaveAttribute("href", "/login/mechanic");
        expect(
            screen.getByRole("link", { name: /admin login/i })
        ).toHaveAttribute("href", "/login/admin");
    });

    test("offers mechanic and admin registration", () => {
        renderLanding();

        expect(
            screen.getByRole("link", { name: /register as mechanic/i })
        ).toHaveAttribute("href", "/register/mechanic");
        expect(
            screen.getByRole("link", { name: /register as admin/i })
        ).toHaveAttribute("href", "/register/admin");
    });

    test("explains the mechanic approval and admin secret workflows", () => {
        renderLanding();

        expect(
            screen.getByText(/an administrator must approve it/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/registration secret/i)
        ).toBeInTheDocument();
    });
});
