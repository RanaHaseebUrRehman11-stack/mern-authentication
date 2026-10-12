const {
    app,
    request,
    loginUser,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");
const User = require("../models/user");
const Mechanic = require("../models/mechanic");

const registerMechanic = (overrides = {}) =>
    request(app)
        .post("/api/auth/register/mechanic")
        .send({
            name: "Self Mechanic",
            email: "self@example.com",
            password: "mechanic123",
            phone: "5551234567",
            specialization: "Brakes",
            experience: 3,
            ...overrides
        });

const registerAdmin = (overrides = {}) =>
    request(app)
        .post("/api/auth/register/admin")
        .send({
            username: "New Admin",
            email: "newadmin@example.com",
            password: "adminpassword",
            adminSecret: "test-admin-secret",
            ...overrides
        });

describe("Public mechanic registration", () => {
    test("creates a linked mechanic account in the Pending state", async () => {
        const response = await registerMechanic();

        expect(response.status).toBe(201);
        expect(response.body.approvalStatus).toBe("Pending");

        const user = await User.findOne({ email: "self@example.com" });
        expect(user.role).toBe("mechanic");

        const mechanic = await Mechanic.findOne({ email: "self@example.com" });
        expect(mechanic.approvalStatus).toBe("Pending");
        expect(mechanic.user.toString()).toBe(user._id.toString());
    });

    test("rejects a duplicate email", async () => {
        await registerMechanic();
        const response = await registerMechanic();

        expect(response.status).toBe(400);
        expect(await Mechanic.countDocuments()).toBe(1);
    });

    test("rejects invalid payloads", async () => {
        const shortPassword = await registerMechanic({ password: "123" });
        expect(shortPassword.status).toBe(400);

        const badEmail = await registerMechanic({ email: "nope" });
        expect(badEmail.status).toBe(400);

        const missingPhone = await registerMechanic({ phone: "" });
        expect(missingPhone.status).toBe(400);

        const badExperience = await registerMechanic({ experience: -1 });
        expect(badExperience.status).toBe(400);
    });

    test("a pending mechanic cannot log in", async () => {
        await registerMechanic();
        const response = await loginUser({
            email: "self@example.com",
            password: "mechanic123"
        });

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("MECHANIC_PENDING");
    });

    test("admin approval lets the mechanic log in and marks them Available", async () => {
        const adminToken = await createAdminAndLogin();
        await registerMechanic();

        const mechanic = await Mechanic.findOne({ email: "self@example.com" });

        const approval = await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Approved" });

        expect(approval.status).toBe(200);
        expect(approval.body.mechanic.approvalStatus).toBe("Approved");
        expect(approval.body.mechanic.status).toBe("Available");

        const loginResponse = await loginUser({
            email: "self@example.com",
            password: "mechanic123"
        });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe("mechanic");
    });

    test("a rejected mechanic cannot log in", async () => {
        const adminToken = await createAdminAndLogin();
        await registerMechanic();

        const mechanic = await Mechanic.findOne({ email: "self@example.com" });

        await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Rejected" });

        const response = await loginUser({
            email: "self@example.com",
            password: "mechanic123"
        });

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("MECHANIC_REJECTED");
    });

    test("an inactive mechanic cannot log in", async () => {
        const adminToken = await createAdminAndLogin();
        await registerMechanic();

        const mechanic = await Mechanic.findOne({ email: "self@example.com" });

        await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Approved" });

        await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}`)
            .set(authHeader(adminToken))
            .send({ status: "Inactive" });

        const response = await loginUser({
            email: "self@example.com",
            password: "mechanic123"
        });

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("MECHANIC_INACTIVE");
    });

    test("revokes an existing mechanic token after a rejection", async () => {
        const adminToken = await createAdminAndLogin();
        await registerMechanic();

        const mechanic = await Mechanic.findOne({ email: "self@example.com" });

        await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Approved" });

        const loginResponse = await loginUser({
            email: "self@example.com",
            password: "mechanic123"
        });
        const mechanicToken = loginResponse.body.token;

        await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Rejected" });

        const blocked = await request(app)
            .get("/api/mechanic/jobs")
            .set(authHeader(mechanicToken));

        expect(blocked.status).toBe(403);
        expect(blocked.body.code).toBe("MECHANIC_REJECTED");
    });

    test("validates the approval endpoint", async () => {
        const adminToken = await createAdminAndLogin();

        const invalid = await request(app)
            .put("/api/admin/mechanics/not-an-id/approval")
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Approved" });
        expect(invalid.status).toBe(400);

        const badStatus = await request(app)
            .put("/api/admin/mechanics/000000000000000000000000/approval")
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Whatever" });
        expect(badStatus.status).toBe(400);

        const missing = await request(app)
            .put("/api/admin/mechanics/000000000000000000000000/approval")
            .set(authHeader(adminToken))
            .send({ approvalStatus: "Approved" });
        expect(missing.status).toBe(404);
    });

    test("blocks non-admins from approving mechanics", async () => {
        const ownerToken = await createAndLogin();
        await registerMechanic();
        const mechanic = await Mechanic.findOne({ email: "self@example.com" });

        const response = await request(app)
            .put(`/api/admin/mechanics/${mechanic._id}/approval`)
            .set(authHeader(ownerToken))
            .send({ approvalStatus: "Approved" });

        expect(response.status).toBe(403);
    });
});

describe("Secure administrator registration", () => {
    test("creates an administrator with the correct secret", async () => {
        const response = await registerAdmin();

        expect(response.status).toBe(201);

        const user = await User.findOne({ email: "newadmin@example.com" });
        expect(user.role).toBe("admin");

        const loginResponse = await loginUser({
            email: "newadmin@example.com",
            password: "adminpassword"
        });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe("admin");
    });

    test("rejects a wrong secret", async () => {
        const response = await registerAdmin({ adminSecret: "wrong-secret" });

        expect(response.status).toBe(403);
        expect(await User.countDocuments({ role: "admin" })).toBe(0);
    });

    test("is disabled when no secret is configured", async () => {
        const original = process.env.ADMIN_REGISTRATION_SECRET;
        delete process.env.ADMIN_REGISTRATION_SECRET;

        try {
            const response = await registerAdmin();
            expect(response.status).toBe(403);
        } finally {
            process.env.ADMIN_REGISTRATION_SECRET = original;
        }
    });

    test("is disabled when ADMIN_REGISTRATION_ENABLED is false", async () => {
        const original = process.env.ADMIN_REGISTRATION_ENABLED;
        process.env.ADMIN_REGISTRATION_ENABLED = "false";

        try {
            const response = await registerAdmin();
            expect(response.status).toBe(403);
        } finally {
            process.env.ADMIN_REGISTRATION_ENABLED = original;
        }
    });

    test("rejects duplicate administrator email", async () => {
        await registerAdmin();
        const response = await registerAdmin();

        expect(response.status).toBe(400);
    });
});

describe("Role escalation prevention", () => {
    test("public register ignores a supplied admin role", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "Sneaky",
            email: "sneaky@example.com",
            password: "password123",
            role: "admin"
        });

        expect(response.status).toBe(201);

        const user = await User.findOne({ email: "sneaky@example.com" });
        expect(user.role).toBe("user");
    });

    test("owners cannot reach admin or mechanic APIs", async () => {
        const token = await createAndLogin();

        const admin = await request(app)
            .get("/api/admin/dashboard")
            .set(authHeader(token));
        expect(admin.status).toBe(403);

        const mechanic = await request(app)
            .get("/api/mechanic/jobs")
            .set(authHeader(token));
        expect(mechanic.status).toBe(403);
    });
});
