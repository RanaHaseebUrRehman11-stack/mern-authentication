const {
    app,
    request,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");
const Mechanic = require("../models/mechanic");

const createMechanic = async (adminToken, overrides = {}) => {
    const response = await request(app)
        .post("/api/admin/mechanics")
        .set(authHeader(adminToken))
        .send({
            name: "Jane Mechanic",
            email: "jane@example.com",
            phone: "1234567890",
            specialization: "Engine",
            experience: 5,
            ...overrides
        });

    return response.body.mechanic;
};

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

const createRequest = async (token, vehicle) => {
    const response = await request(app)
        .post("/api/service-requests")
        .set(authHeader(token))
        .send({
            vehicle: vehicle._id,
            serviceType: "Oil Change",
            description: "Routine"
        });

    return response.body.serviceRequest;
};

const assign = (adminToken, requestId, mechanicId) =>
    request(app)
        .put(`/api/service-requests/${requestId}/assign`)
        .set(authHeader(adminToken))
        .send({ mechanic: mechanicId });

const login = (email, password) =>
    request(app).post("/api/auth/login").send({ email, password });

describe("Mechanic portal", () => {
    test("admin can create a mechanic with a linked login account", async () => {
        const adminToken = await createAdminAndLogin();

        const response = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send({
                name: "Jane Mechanic",
                email: "jane@example.com",
                phone: "1234567890",
                specialization: "Engine",
                experience: 5,
                password: "mechanic123"
            });

        expect(response.status).toBe(201);
        expect(response.body.accountCreated).toBe(true);

        const loginResponse = await login("jane@example.com", "mechanic123");
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe("mechanic");
    });

    test("rejects a second account for the same mechanic (409)", async () => {
        const adminToken = await createAdminAndLogin();
        const mechanic = await createMechanic(adminToken, {
            email: "jane@example.com"
        });

        await request(app)
            .post(`/api/admin/mechanics/${mechanic._id}/account`)
            .set(authHeader(adminToken))
            .send({ password: "mechanic123" });

        const response = await request(app)
            .post(`/api/admin/mechanics/${mechanic._id}/account`)
            .set(authHeader(adminToken))
            .send({ password: "another123" });

        expect(response.status).toBe(409);
    });

    test("blocks non-mechanics from the mechanic API", async () => {
        const ownerToken = await createAndLogin();

        const response = await request(app)
            .get("/api/mechanic/jobs")
            .set(authHeader(ownerToken));

        expect(response.status).toBe(403);
    });

    test("mechanic only sees and mutates their own jobs", async () => {
        const adminToken = await createAdminAndLogin();
        const ownerToken = await createAndLogin({ email: "owner@example.com" });

        const m1 = await createMechanic(adminToken, {
            email: "m1@example.com",
            password: "mechanic123"
        });
        const m2 = await createMechanic(adminToken, {
            email: "m2@example.com",
            password: "mechanic123"
        });

        const vehicle = await createVehicle(ownerToken);
        const r1 = await createRequest(ownerToken, vehicle);

        // Second vehicle to avoid the global unique vehicle-number constraint.
        const vehicle2 = await createVehicle(ownerToken, {
            vehicleNumber: "XYZ-987"
        });
        const r2 = await createRequest(ownerToken, vehicle2);

        await assign(adminToken, r1._id, m1._id);
        await assign(adminToken, r2._id, m2._id);

        const m1Login = await login("m1@example.com", "mechanic123");
        const m1Token = m1Login.body.token;

        const jobs = await request(app)
            .get("/api/mechanic/jobs")
            .set(authHeader(m1Token));

        expect(jobs.status).toBe(200);
        expect(jobs.body.jobs).toHaveLength(1);
        expect(jobs.body.jobs[0]._id).toBe(r1._id);

        const foreignJob = await request(app)
            .get(`/api/mechanic/jobs/${r2._id}`)
            .set(authHeader(m1Token));

        expect(foreignJob.status).toBe(404);

        const foreignUpdate = await request(app)
            .put(`/api/mechanic/jobs/${r2._id}/status`)
            .set(authHeader(m1Token))
            .send({ status: "In Progress" });

        expect(foreignUpdate.status).toBe(404);
    });

    test("mechanic follows the allowed job transitions only", async () => {
        const adminToken = await createAdminAndLogin();
        const ownerToken = await createAndLogin({ email: "owner@example.com" });

        const mechanic = await createMechanic(adminToken, {
            email: "m1@example.com",
            password: "mechanic123"
        });

        const vehicle = await createVehicle(ownerToken);
        const serviceRequest = await createRequest(ownerToken, vehicle);

        await assign(adminToken, serviceRequest._id, mechanic._id);

        const mechanicLogin = await login("m1@example.com", "mechanic123");
        const mechanicToken = mechanicLogin.body.token;

        // A mechanic cannot skip straight to Completed.
        const skip = await request(app)
            .put(`/api/mechanic/jobs/${serviceRequest._id}/status`)
            .set(authHeader(mechanicToken))
            .send({ status: "Completed" });

        expect(skip.status).toBe(400);

        const start = await request(app)
            .put(`/api/mechanic/jobs/${serviceRequest._id}/status`)
            .set(authHeader(mechanicToken))
            .send({ status: "In Progress" });

        expect(start.status).toBe(200);

        const complete = await request(app)
            .put(`/api/mechanic/jobs/${serviceRequest._id}/status`)
            .set(authHeader(mechanicToken))
            .send({ status: "Completed" });

        expect(complete.status).toBe(200);
        expect(complete.body.job.completedAt).toBeTruthy();
    });

    test("a mechanic cannot lock themselves out via Inactive availability", async () => {
        const adminToken = await createAdminAndLogin();
        await createMechanic(adminToken, {
            email: "m1@example.com",
            password: "mechanic123"
        });

        const mechanicLogin = await login("m1@example.com", "mechanic123");
        const mechanicToken = mechanicLogin.body.token;

        const update = await request(app)
            .put("/api/mechanic/profile")
            .set(authHeader(mechanicToken))
            .send({ status: "Inactive" });

        // Deactivation is an administrator action; self-service may only toggle
        // Available/Busy, otherwise the mechanic would be blocked from the very
        // portal needed to undo it.
        expect(update.status).toBe(400);

        const jobs = await request(app)
            .get("/api/mechanic/jobs")
            .set(authHeader(mechanicToken));

        expect(jobs.status).toBe(200);
    });

    test("does not delete a mechanic referenced by a service request (409)", async () => {
        const adminToken = await createAdminAndLogin();
        const ownerToken = await createAndLogin({ email: "owner@example.com" });

        const mechanic = await createMechanic(adminToken);
        const vehicle = await createVehicle(ownerToken);
        const serviceRequest = await createRequest(ownerToken, vehicle);

        await assign(adminToken, serviceRequest._id, mechanic._id);

        const response = await request(app)
            .delete(`/api/admin/mechanics/${mechanic._id}`)
            .set(authHeader(adminToken));

        expect(response.status).toBe(409);
        expect(await Mechanic.countDocuments()).toBe(1);
    });
});
