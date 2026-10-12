import { afterEach, beforeEach, describe, expect, test } from "vitest";

import api from "../api";

const origin = window.location;

const rejectWith = (status, data) => {
    api.defaults.adapter = () =>
        Promise.reject({ response: { status, data }, config: {} });
};

describe("api response interceptor", () => {
    beforeEach(() => {
        localStorage.setItem("token", "t");
        localStorage.setItem("user", '{"role":"mechanic"}');
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { pathname: "/dashboard", href: "" }
        });
    });

    afterEach(() => {
        api.defaults.adapter = undefined;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: origin
        });
    });

    test("clears the session on 401", async () => {
        rejectWith(401, { message: "expired" });

        await expect(api.get("/x")).rejects.toBeTruthy();

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
    });

    test("clears the session on a MECHANIC_ 403 (revoked mid-session)", async () => {
        rejectWith(403, { code: "MECHANIC_REJECTED", message: "denied" });

        await expect(api.get("/x")).rejects.toBeTruthy();

        expect(localStorage.getItem("token")).toBeNull();
    });

    test("keeps the session on a plain 403", async () => {
        rejectWith(403, { message: "forbidden" });

        await expect(api.get("/x")).rejects.toBeTruthy();

        expect(localStorage.getItem("token")).toBe("t");
    });

    test("exposes a friendly message from the response", async () => {
        rejectWith(400, { message: "Bad request" });

        const error = await api.get("/x").catch((e) => e);

        expect(error.friendlyMessage).toBe("Bad request");
    });
});
