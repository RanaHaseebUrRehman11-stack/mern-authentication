const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const {
    app,
    request,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Mechanic = require("../models/mechanic");
const ServiceRequest = require("../models/serviceRequest");

const createVehicle = async (token, overrides = {}) => {
    const response = await request(app)
        .post("/api/vehicles")
        .set(authHeader(token))
        .send({
            vehicleNumber: "ABC-123",
            company: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "White",
            ...overrides
        });

    return response.body.vehicle;
};

const createMechanic = async (adminToken, overrides = {}) =>
    (
        await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send({
                name: "Mech",
                email: "mech@example.com",
                phone: "1234567890",
                specialization: "Engine",
                experience: 5,
                ...overrides
            })
    ).body.mechanic;

const createRequest = async (token, vehicle) =>
    (
        await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            })
    ).body.serviceRequest;

describe("Token integrity", () => {
    test("rejects an expired token", async () => {
        const user = await User.create({
            username: "Expired",
            email: "expired@example.com",
            password: "password123"
        });

        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: -10 }
        );

        const response = await request(app)
            .get("/api/auth/profile")
            .set(authHeader(token));

        expect(response.status).toBe(401);
    });

    test("rejects a token for a non-existent account", async () => {
        const token = jwt.sign(
            { id: new mongoose.Types.ObjectId().toString(), role: "user" },
            process.env.JWT_SECRET
        );

        const response = await request(app)
            .get("/api/auth/profile")
            .set(authHeader(token));

        expect(response.status).toBe(401);
    });

    test("ignores a forged role claim and uses the database role", async () => {
        await createAndLogin();

        const user = await User.findOne({ email: "user@example.com" });

        // Correctly signed by the server secret, but the account is a normal
        // user. The admin middleware must trust the DB, not the token claim.
        const forged = jwt.sign(
            { id: user._id, role: "admin" },
            process.env.JWT_SECRET
        );

        const response = await request(app)
            .get("/api/admin/users")
            .set(authHeader(forged));

        expect(response.status).toBe(403);
    });
});

describe("Cross-role access control", () => {
    test("an owner cannot call admin or mechanic endpoints", async () => {
        const token = await createAndLogin();

        const cases = [
            ["get", "/api/admin/dashboard"],
            ["get", "/api/admin/mechanics"],
            ["get", "/api/service-requests"],
            ["get", "/api/mechanic/jobs"],
            ["get", "/api/mechanic/profile"]
        ];

        for (const [method, url] of cases) {
            const response = await request(app)[method](url).set(
                authHeader(token)
            );
            expect(response.status).toBe(403);
        }
    });

    test("an owner cannot create a mechanic through the admin route", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(token))
            .send({
                name: "Sneaky",
                email: "sneaky@example.com",
                phone: "1234567890",
                specialization: "Engine",
                experience: 5
            });

        expect(response.status).toBe(403);
        expect(await Mechanic.countDocuments()).toBe(0);
    });
});

describe("Mass assignment protection", () => {
    test("service request creation ignores client-supplied status/user/mechanic", async () => {
        const token = await createAndLogin();
        const vehicle = await createVehicle(token);

        const impostor = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine",
                status: "Completed",
                mechanic: impostor,
                completedAt: new Date().toISOString()
            });

        expect(response.status).toBe(201);

        const stored = await ServiceRequest.findById(
            response.body.serviceRequest._id
        );

        expect(stored.status).toBe("Pending");
        expect(stored.mechanic).toBeNull();
        expect(stored.completedAt).toBeNull();
    });
});

describe("Sensitive data exposure", () => {
    test("no endpoint leaks the password hash", async () => {
        const ownerToken = await createAndLogin();
        const adminToken = await createAdminAndLogin();

        const bodies = [
            (
                await request(app)
                    .get("/api/auth/profile")
                    .set(authHeader(ownerToken))
            ).body,
            (
                await request(app)
                    .get("/api/admin/users")
                    .set(authHeader(adminToken))
            ).body
        ];

        const serialized = JSON.stringify(bodies);
        expect(serialized).not.toContain("password");
        expect(serialized).not.toContain("$2b$");
    });
});

describe("CORS", () => {
    test("rejects a disallowed origin with 403 (not 500)", async () => {
        const response = await request(app)
            .get("/")
            .set("Origin", "http://evil.example.com");

        expect(response.status).toBe(403);
    });

    test("allows the configured development origin", async () => {
        const response = await request(app)
            .get("/")
            .set("Origin", "http://localhost:5173");

        expect(response.status).toBe(200);
        expect(response.headers["access-control-allow-origin"]).toBe(
            "http://localhost:5173"
        );
    });
});

describe("Malformed input handling", () => {
    test("returns 400 for malformed JSON instead of 500", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .set("Content-Type", "application/json")
            .send('{"email": "not closed"');

        expect(response.status).toBe(400);
    });

    test("returns 404 for an unknown route", async () => {
        const response = await request(app).get("/api/does-not-exist");

        expect(response.status).toBe(404);
    });
});

describe("Assignment guard rails", () => {
    test("an inactive mechanic cannot be assigned (409)", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);
        const mechanic = await createMechanic(adminToken, {
            status: "Inactive"
        });

        const serviceRequest = await createRequest(token, vehicle);

        const response = await request(app)
            .put(`/api/service-requests/${serviceRequest._id}/assign`)
            .set(authHeader(adminToken))
            .send({ mechanic: mechanic._id });

        expect(response.status).toBe(409);
    });

    test("a terminal request cannot be reassigned (409)", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);
        const mechanic = await createMechanic(adminToken);
        const serviceRequest = await createRequest(token, vehicle);

        await request(app)
            .put(`/api/service-requests/${serviceRequest._id}/assign`)
            .set(authHeader(adminToken))
            .send({ mechanic: mechanic._id });

        await request(app)
            .put(`/api/service-requests/${serviceRequest._id}/status`)
            .set(authHeader(adminToken))
            .send({ status: "Cancelled" });

        const response = await request(app)
            .put(`/api/service-requests/${serviceRequest._id}/assign`)
            .set(authHeader(adminToken))
            .send({ mechanic: mechanic._id });

        expect(response.status).toBe(409);
    });
});

describe("Admin self-protection", () => {
    test("an admin cannot delete their own account (403)", async () => {
        const adminToken = await createAdminAndLogin();
        const admin = await User.findOne({ email: "admin@example.com" });

        const response = await request(app)
            .delete(`/api/admin/users/${admin._id}`)
            .set(authHeader(adminToken));

        expect(response.status).toBe(403);
        expect((await User.findById(admin._id)).isActive).not.toBe(false);
    });

    test("a mechanic account cannot be deleted via the users endpoint", async () => {
        const adminToken = await createAdminAndLogin();
        await createMechanic(adminToken, {
            email: "linked@example.com",
            password: "mechanic123"
        });

        const account = await User.findOne({ email: "linked@example.com" });

        const response = await request(app)
            .delete(`/api/admin/users/${account._id}`)
            .set(authHeader(adminToken));

        // Deleting only the login user would leave an active Mechanic record
        // that can still be assigned jobs but can never sign in again.
        expect(response.status).not.toBe(200);
        expect((await User.findById(account._id)).isActive).not.toBe(false);
    });
});
