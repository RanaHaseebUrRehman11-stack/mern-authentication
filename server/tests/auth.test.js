const {
    app,
    request,
    registerUser,
    loginUser,
    createAndLogin,
    authHeader
} = require("./helpers");
const User = require("../models/user");

describe("Authentication", () => {
    describe("POST /api/auth/register", () => {
        test("registers a new user", async () => {
            const response = await registerUser();

            expect(response.status).toBe(201);
            expect(response.body.message).toMatch(/registered/i);
        });

        test("rejects duplicate email", async () => {
            await registerUser();
            const response = await registerUser();

            expect(response.status).toBe(400);
        });

        test("rejects invalid email", async () => {
            const response = await registerUser({ email: "not-an-email" });

            expect(response.status).toBe(400);
        });

        test("rejects short password", async () => {
            const response = await registerUser({ password: "123" });

            expect(response.status).toBe(400);
        });

        test("hashes the password before storing", async () => {
            await registerUser();

            const user = await User.findOne({ email: "user@example.com" });

            expect(user.password).not.toBe("password123");
            expect(user.password.length).toBeGreaterThan(20);
        });
    });

    describe("POST /api/auth/login", () => {
        test("logs in with valid credentials", async () => {
            await registerUser();
            const response = await loginUser();

            expect(response.status).toBe(200);
            expect(response.body.token).toBeTruthy();
            expect(response.body.user.email).toBe("user@example.com");
            expect(response.body.user.password).toBeUndefined();
        });

        test("rejects wrong password", async () => {
            await registerUser();
            const response = await loginUser({ password: "wrongpassword" });

            expect(response.status).toBe(400);
        });

        test("rejects unknown email", async () => {
            const response = await loginUser({ email: "missing@example.com" });

            expect(response.status).toBe(400);
        });

        test("rejects deactivated users", async () => {
            await registerUser();
            await User.updateOne(
                { email: "user@example.com" },
                { isActive: false }
            );

            const response = await loginUser();

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/auth/profile", () => {
        test("requires a token", async () => {
            const response = await request(app).get("/api/auth/profile");

            expect(response.status).toBe(401);
        });

        test("rejects an invalid token", async () => {
            const response = await request(app)
                .get("/api/auth/profile")
                .set(authHeader("invalid.token.value"));

            expect(response.status).toBe(401);
        });

        test("returns the current user without the password", async () => {
            const token = await createAndLogin();

            const response = await request(app)
                .get("/api/auth/profile")
                .set(authHeader(token));

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe("user@example.com");
            expect(response.body.user.password).toBeUndefined();
        });

        test("rejects a token whose user was deactivated after login", async () => {
            const token = await createAndLogin();

            await User.updateOne(
                { email: "user@example.com" },
                { isActive: false }
            );

            const response = await request(app)
                .get("/api/auth/profile")
                .set(authHeader(token));

            expect(response.status).toBe(401);
        });
    });

    describe("PUT /api/auth/profile", () => {
        test("updates the username", async () => {
            const token = await createAndLogin();

            const response = await request(app)
                .put("/api/auth/profile")
                .set(authHeader(token))
                .send({ username: "Renamed User" });

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe("Renamed User");
        });

        test("rejects a password change with the wrong current password", async () => {
            const token = await createAndLogin();

            const response = await request(app)
                .put("/api/auth/profile")
                .set(authHeader(token))
                .send({
                    currentPassword: "wrongpassword",
                    newPassword: "newpassword123"
                });

            expect(response.status).toBe(400);
        });

        test("changes the password when the current one matches", async () => {
            const token = await createAndLogin();

            const changed = await request(app)
                .put("/api/auth/profile")
                .set(authHeader(token))
                .send({
                    currentPassword: "password123",
                    newPassword: "newpassword123"
                });

            expect(changed.status).toBe(200);

            const relogin = await loginUser({ password: "newpassword123" });
            expect(relogin.status).toBe(200);
        });
    });
});
